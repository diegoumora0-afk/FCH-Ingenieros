package com.fch.wms.service;

import com.fch.wms.dto.MaterialDTO;
import com.fch.wms.dto.MovimientoDTO;
import com.fch.wms.mapper.MaterialMapper;
import com.fch.wms.mapper.MovimientoMapper;
import com.fch.wms.repository.MaterialRepository;
import com.fch.wms.repository.MovimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ReporteService - Agrega datos para los dashboards gerenciales.
 *
 * Reportes disponibles:
 * 1. Inventario general: estado actual de todos los materiales
 * 2. Consumo por cuadrilla: qué material salió hacia qué personal
 * 3. Movimientos por proyecto y rango de fechas: para valorizaciones de obra
 */
@Service
public class ReporteService {

    @Autowired private MaterialRepository materialRepository;
    @Autowired private MaterialMapper materialMapper;
    @Autowired private MovimientoRepository movimientoRepository;
    @Autowired private MovimientoMapper movimientoMapper;

    /**
     * Reporte 1: Estado general del inventario.
     * Devuelve todos los materiales con su stock actual y si están bajo el mínimo.
     * Sirve para el dashboard principal de la Gerencia.
     */
    public Map<String, Object> reporteInventarioGeneral() {
        List<MaterialDTO> todos = materialRepository.findAll().stream()
                .map(materialMapper::toDTO).collect(Collectors.toList());

        List<MaterialDTO> bajoMinimo = materialRepository
                .findByStockActualLessThanEqual().stream()
                .map(materialMapper::toDTO).collect(Collectors.toList());

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("totalMateriales", todos.size());
        reporte.put("materialesConAlerta", bajoMinimo.size());
        reporte.put("inventario", todos);
        reporte.put("alertasStockMinimo", bajoMinimo);
        reporte.put("generadoEn", LocalDateTime.now());
        return reporte;
    }

    /**
     * Reporte 2: Consumo de materiales por cuadrilla (personal de obra).
     * Muestra todas las salidas asociadas a un personal específico.
     * Útil para valorizaciones y control de mermas por sector.
     */
    public Map<String, Object> reporteConsumoPorPersonal(Integer idPersonal) {
        List<MovimientoDTO> salidas = movimientoRepository
                .findByIdPersonalAndTipoMovimiento(idPersonal, "SALIDA").stream()
                .map(movimientoMapper::toDTO).collect(Collectors.toList());

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("idPersonal", idPersonal);
        reporte.put("totalDespachos", salidas.size());
        reporte.put("salidas", salidas);
        reporte.put("generadoEn", LocalDateTime.now());
        return reporte;
    }

    /**
     * Reporte 3: Movimientos de un proyecto en un rango de fechas.
     * Para el Residente de Obra y la Gerencia: ver todo lo que entró/salió
     * en "Dunas de Carhuaz 1" durante un período determinado.
     */
    public Map<String, Object> reporteMovimientosPorProyecto(
            Integer idProyecto, LocalDateTime fechaInicio, LocalDateTime fechaFin) {

        List<MovimientoDTO> movimientos = movimientoRepository
                .findByProyectoYFecha(idProyecto, fechaInicio, fechaFin).stream()
                .map(movimientoMapper::toDTO).collect(Collectors.toList());

        long entradas = movimientos.stream()
                .filter(m -> "ENTRADA".equals(m.getTipoMovimiento())).count();
        long salidas = movimientos.stream()
                .filter(m -> "SALIDA".equals(m.getTipoMovimiento())).count();

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("idProyecto", idProyecto);
        reporte.put("fechaInicio", fechaInicio);
        reporte.put("fechaFin", fechaFin);
        reporte.put("totalMovimientos", movimientos.size());
        reporte.put("totalEntradas", entradas);
        reporte.put("totalSalidas", salidas);
        reporte.put("movimientos", movimientos);
        reporte.put("generadoEn", LocalDateTime.now());
        return reporte;
    }
}
