package com.fch.wms.service;

import com.fch.wms.dto.MovimientoDTO;
import com.fch.wms.entity.DetalleMovimiento;
import com.fch.wms.entity.KardexInventario;
import com.fch.wms.entity.Material;
import com.fch.wms.entity.Movimiento;
import com.fch.wms.mapper.MovimientoMapper;
import com.fch.wms.payload.request.RegistrarMovimientoRequest;
import com.fch.wms.repository.DetalleMovimientoRepository;
import com.fch.wms.repository.KardexInventarioRepository;
import com.fch.wms.repository.MaterialRepository;
import com.fch.wms.repository.MovimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * MovimientoService - El servicio más crítico del WMS.
 *
 * Toda operación de registro (entrada/salida) es @Transactional:
 * si cualquier paso falla (ej. stock insuficiente en el ítem 3 de 5),
 * TODA la operación se revierte automáticamente. Ninguna tabla queda
 * en estado inconsistente.
 *
 * Flujo de ENTRADA:
 * 1. Crear cabecera en Movimientos
 * 2. Por cada detalle: crear Detalle_Movimiento + SUMAR stock_actual en Materiales
 * 3. Registrar cada cambio en Kardex_Inventario
 *
 * Flujo de SALIDA:
 * 1. Validar stock disponible para CADA material antes de tocar nada
 * 2. Crear cabecera en Movimientos
 * 3. Por cada detalle: crear Detalle_Movimiento + RESTAR stock_actual en Materiales
 * 4. Registrar cada cambio en Kardex_Inventario
 */
@Service
public class MovimientoService {

    @Autowired private MovimientoRepository movimientoRepository;
    @Autowired private DetalleMovimientoRepository detalleMovimientoRepository;
    @Autowired private MaterialRepository materialRepository;
    @Autowired private KardexInventarioRepository kardexRepository;
    @Autowired private MovimientoMapper movimientoMapper;

    /** Listar todos los movimientos */
    public List<MovimientoDTO> listarTodos() {
        return movimientoRepository.findAll().stream()
                .map(movimientoMapper::toDTO).collect(Collectors.toList());
    }

    /** Ver un movimiento con su cabecera */
    public MovimientoDTO buscarPorId(Integer id) {
        Movimiento m = movimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado: " + id));
        return movimientoMapper.toDTO(m);
    }

    /**
     * Registra una ENTRADA de materiales al almacén.
     * Operación atómica: suma stock + escribe kardex.
     */
    @Transactional
    public MovimientoDTO registrarEntrada(RegistrarMovimientoRequest request) {
        request.setTipoMovimiento("ENTRADA");

        // 1. Crear y guardar la cabecera del movimiento
        Movimiento movimiento = construirMovimiento(request);
        movimiento = movimientoRepository.save(movimiento);
        final Integer idMovimiento = movimiento.getIdMovimiento();

        // 2. Procesar cada línea de detalle
        for (RegistrarMovimientoRequest.DetalleRequest detalle : request.getDetalles()) {
            Material material = materialRepository.findById(detalle.getIdMaterial())
                    .orElseThrow(() -> new RuntimeException(
                            "Material no encontrado: " + detalle.getIdMaterial()));

            BigDecimal saldoInicial = material.getStockActual();

            // SUMAR al stock actual
            material.setStockActual(saldoInicial.add(detalle.getCantidad()));
            materialRepository.save(material);

            // Guardar línea de detalle
            guardarDetalle(idMovimiento, detalle.getIdMaterial(), detalle.getCantidad());

            // Escribir en el Kardex
            escribirKardex(material.getIdMaterial(), idMovimiento,
                    saldoInicial, detalle.getCantidad(), BigDecimal.ZERO);
        }

        return movimientoMapper.toDTO(movimiento);
    }

    /**
     * Registra una SALIDA de materiales hacia una cuadrilla.
     * Valida stock ANTES de iniciar cualquier operación.
     * Operación atómica: resta stock + escribe kardex.
     */
    @Transactional
    public MovimientoDTO registrarSalida(RegistrarMovimientoRequest request) {
        request.setTipoMovimiento("SALIDA");

        // 1. VALIDACIÓN PREVIA: verificar stock para TODOS los materiales antes de procesar
        //    Si alguno falla, la transacción no ha tocado ningún dato aún.
        for (RegistrarMovimientoRequest.DetalleRequest detalle : request.getDetalles()) {
            Material material = materialRepository.findById(detalle.getIdMaterial())
                    .orElseThrow(() -> new RuntimeException(
                            "Material no encontrado: " + detalle.getIdMaterial()));

            if (material.getStockActual().compareTo(detalle.getCantidad()) < 0) {
                throw new RuntimeException(
                        "Stock insuficiente para: '" + material.getNombre() +
                        "'. Stock disponible: " + material.getStockActual() +
                        " | Solicitado: " + detalle.getCantidad());
            }
        }

        // 2. Todas las validaciones pasaron: crear la cabecera
        Movimiento movimiento = construirMovimiento(request);
        movimiento = movimientoRepository.save(movimiento);
        final Integer idMovimiento = movimiento.getIdMovimiento();

        // 3. Procesar cada línea descontando el stock
        for (RegistrarMovimientoRequest.DetalleRequest detalle : request.getDetalles()) {
            Material material = materialRepository.findById(detalle.getIdMaterial()).get();

            BigDecimal saldoInicial = material.getStockActual();

            // RESTAR del stock actual
            material.setStockActual(saldoInicial.subtract(detalle.getCantidad()));
            materialRepository.save(material);

            // Guardar línea de detalle
            guardarDetalle(idMovimiento, detalle.getIdMaterial(), detalle.getCantidad());

            // Escribir en el Kardex
            escribirKardex(material.getIdMaterial(), idMovimiento,
                    saldoInicial, BigDecimal.ZERO, detalle.getCantidad());
        }

        return movimientoMapper.toDTO(movimiento);
    }

    // ─── Métodos privados de ayuda ────────────────────────────────────────────

    private Movimiento construirMovimiento(RegistrarMovimientoRequest request) {
        Movimiento m = new Movimiento();
        m.setTipoMovimiento(request.getTipoMovimiento());
        m.setFechaHora(LocalDateTime.now());
        m.setIdUsuario(request.getIdUsuario());
        m.setIdPersonal(request.getIdPersonal());
        m.setIdProyecto(request.getIdProyecto());
        m.setIdProveedor(request.getIdProveedor());
        m.setIdSolicitud(request.getIdSolicitud());
        m.setNroGuia(request.getNroGuia());
        m.setObservaciones(request.getObservaciones());
        return m;
    }

    private void guardarDetalle(Integer idMovimiento, Integer idMaterial, BigDecimal cantidad) {
        DetalleMovimiento detalle = new DetalleMovimiento();
        detalle.setIdMovimiento(idMovimiento);
        detalle.setIdMaterial(idMaterial);
        detalle.setCantidad(cantidad);
        detalleMovimientoRepository.save(detalle);
    }

    private void escribirKardex(Integer idMaterial, Integer idMovimiento,
                                 BigDecimal saldoInicial, BigDecimal ingreso, BigDecimal salida) {
        KardexInventario kardex = new KardexInventario();
        kardex.setIdMaterial(idMaterial);
        kardex.setIdMovimiento(idMovimiento);
        kardex.setFechaRegistro(LocalDateTime.now());
        kardex.setSaldoInicial(saldoInicial);
        kardex.setIngreso(ingreso);
        kardex.setSalida(salida);
        kardex.setSaldoFinal(saldoInicial.add(ingreso).subtract(salida));
        kardexRepository.save(kardex);
    }
}
