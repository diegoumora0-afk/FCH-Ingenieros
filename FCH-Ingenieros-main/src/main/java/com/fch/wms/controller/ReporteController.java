package com.fch.wms.controller;

import com.fch.wms.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ReporteController
 * BASE URL: /api/reportes
 *
 * GET /api/reportes/inventario-general
 *     → Dashboard gerencial: todos los materiales + alertas de stock mínimo
 *
 * GET /api/reportes/consumo-personal/{idPersonal}
 *     → Cuánto material despachó el almacén a un trabajador/cuadrilla
 *
 * GET /api/reportes/proyecto/{idProyecto}?fechaInicio=...&fechaFin=...
 *     → Todos los movimientos de un proyecto en un rango de fechas
 *
 * Acceso: solo Gerente (definido en SecurityConfig)
 */
@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    /**
     * GET /api/reportes/inventario-general
     * Dashboard principal: estado completo del almacén con alertas.
     */
    @GetMapping("/inventario-general")
    public ResponseEntity<Map<String, Object>> inventarioGeneral() {
        return ResponseEntity.ok(reporteService.reporteInventarioGeneral());
    }

    /**
     * GET /api/reportes/consumo-personal/{idPersonal}
     * Historial de despachos a un personal/cuadrilla específica.
     */
    @GetMapping("/consumo-personal/{idPersonal}")
    public ResponseEntity<Map<String, Object>> consumoPorPersonal(
            @PathVariable Integer idPersonal) {
        return ResponseEntity.ok(reporteService.reporteConsumoPorPersonal(idPersonal));
    }

    /**
     * GET /api/reportes/proyecto/1?fechaInicio=2024-01-01T00:00:00&fechaFin=2024-12-31T23:59:59
     * Movimientos de un proyecto en un rango de fechas para valorizaciones.
     */
    @GetMapping("/proyecto/{idProyecto}")
    public ResponseEntity<Map<String, Object>> movimientosPorProyecto(
            @PathVariable Integer idProyecto,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return ResponseEntity.ok(
                reporteService.reporteMovimientosPorProyecto(idProyecto, fechaInicio, fechaFin));
    }
}
