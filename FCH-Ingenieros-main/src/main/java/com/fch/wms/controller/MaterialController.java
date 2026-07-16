package com.fch.wms.controller;

import com.fch.wms.dto.MaterialDTO;
import com.fch.wms.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MaterialController
 * BASE URL: /api/materiales
 *
 * GET  /api/materiales                → Listar todos
 * GET  /api/materiales/{id}           → Buscar por ID
 * GET  /api/materiales/buscar?q=      → Buscar por nombre o SKU
 * GET  /api/materiales/stock-minimo   → Alertas de reposición
 * POST /api/materiales                → Crear nuevo material
 * PUT  /api/materiales/{id}           → Actualizar material
 */
@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<MaterialDTO>> listarTodos() {
        return ResponseEntity.ok(materialService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(materialService.buscarPorId(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<MaterialDTO>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(materialService.buscar(q));
    }

    @GetMapping("/stock-minimo")
    public ResponseEntity<List<MaterialDTO>> alertasStockMinimo() {
        return ResponseEntity.ok(materialService.listarBajoStockMinimo());
    }

    @PostMapping
    public ResponseEntity<MaterialDTO> crear(@RequestBody MaterialDTO dto) {
        return ResponseEntity.ok(materialService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialDTO> actualizar(
            @PathVariable Integer id, @RequestBody MaterialDTO dto) {
        return ResponseEntity.ok(materialService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        materialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
