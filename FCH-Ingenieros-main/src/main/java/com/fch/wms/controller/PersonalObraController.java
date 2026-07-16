package com.fch.wms.controller;

import com.fch.wms.dto.PersonalObraDTO;
import com.fch.wms.service.PersonalObraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personal")
@CrossOrigin(origins = "*")
public class PersonalObraController {

    @Autowired private PersonalObraService personalObraService;

    @GetMapping
    public ResponseEntity<List<PersonalObraDTO>> listarTodos() {
        return ResponseEntity.ok(personalObraService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonalObraDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(personalObraService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PersonalObraDTO> crear(@RequestBody PersonalObraDTO dto) {
        return ResponseEntity.ok(personalObraService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonalObraDTO> actualizar(
            @PathVariable Integer id, @RequestBody PersonalObraDTO dto) {
        return ResponseEntity.ok(personalObraService.actualizar(id, dto));
    }
}
