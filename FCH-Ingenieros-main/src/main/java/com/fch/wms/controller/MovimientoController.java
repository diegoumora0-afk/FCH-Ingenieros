package com.fch.wms.controller;

import com.fch.wms.dto.MovimientoDTO;
import com.fch.wms.payload.request.RegistrarMovimientoRequest;
import com.fch.wms.service.MovimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * MovimientoController
 * BASE URL: /api/movimientos
 *
 * GET  /api/movimientos           → Historial de todos los movimientos
 * GET  /api/movimientos/{id}      → Detalle de un movimiento
 * POST /api/movimientos/entrada   → Registrar ingreso de materiales (proveedor → almacén)
 * POST /api/movimientos/salida    → Registrar despacho de materiales (almacén → cuadrilla)
 */
@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoController {

    @Autowired
    private MovimientoService movimientoService;

    @GetMapping
    public ResponseEntity<List<MovimientoDTO>> listarTodos() {
        return ResponseEntity.ok(movimientoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(movimientoService.buscarPorId(id));
    }

    /**
     * POST /api/movimientos/entrada
     * Registra material que llega de un proveedor al almacén.
     * Actualiza stock y escribe en Kardex automáticamente.
     */
    @PostMapping("/entrada")
    public ResponseEntity<?> registrarEntrada(@RequestBody RegistrarMovimientoRequest request) {
        try {
            MovimientoDTO result = movimientoService.registrarEntrada(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/movimientos/salida
     * Despacha material del almacén hacia una cuadrilla de trabajo.
     * Valida stock disponible antes de procesar.
     * Si el stock es insuficiente, devuelve 400 con el material que falló.
     */
    @PostMapping("/salida")
    public ResponseEntity<?> registrarSalida(@RequestBody RegistrarMovimientoRequest request) {
        try {
            MovimientoDTO result = movimientoService.registrarSalida(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            // Aquí llega el mensaje "Stock insuficiente para: 'Cable...'"
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
