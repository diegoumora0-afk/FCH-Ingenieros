package com.fch.wms.controller;

import com.fch.wms.dto.KardexInventarioDTO;
import com.fch.wms.service.KardexInventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * KardexInventarioController
 * BASE URL: /api/kardex
 *
 * GET /api/kardex                        → Historial global de auditoría
 * GET /api/kardex/material/{idMaterial}  → Historial de un material específico
 *
 * Acceso: Residente y Gerente (definido en SecurityConfig)
 */
@RestController
@RequestMapping("/api/kardex")
@CrossOrigin(origins = "*")
public class KardexInventarioController {

    @Autowired
    private KardexInventarioService kardexService;

    @GetMapping
    public ResponseEntity<List<KardexInventarioDTO>> listarTodos() {
        return ResponseEntity.ok(kardexService.listarTodos());
    }

    @GetMapping("/material/{idMaterial}")
    public ResponseEntity<List<KardexInventarioDTO>> obtenerPorMaterial(
            @PathVariable Integer idMaterial) {
        return ResponseEntity.ok(kardexService.obtenerPorMaterial(idMaterial));
    }
}
