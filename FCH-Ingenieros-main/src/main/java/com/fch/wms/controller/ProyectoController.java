package com.fch.wms.controller;

import com.fch.wms.dto.ProyectoDTO;
import com.fch.wms.service.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = "*")
public class ProyectoController {

    @Autowired private ProyectoService proyectoService;

    @GetMapping
    public ResponseEntity<List<ProyectoDTO>> listarTodos() {
        return ResponseEntity.ok(proyectoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProyectoDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(proyectoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProyectoDTO> crear(@RequestBody ProyectoDTO dto) {
        return ResponseEntity.ok(proyectoService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProyectoDTO> actualizar(
            @PathVariable Integer id, @RequestBody ProyectoDTO dto) {
        return ResponseEntity.ok(proyectoService.actualizar(id, dto));
    }
}
