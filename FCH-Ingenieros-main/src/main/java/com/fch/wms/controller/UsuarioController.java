package com.fch.wms.controller;

import com.fch.wms.dto.UsuarioDTO;
import com.fch.wms.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    /**
     * Crea un nuevo usuario del sistema.
     * BODY: { "nombreCompleto":"...", "rol":"Almacenero", "username":"...", "password":"..." }
     */
    @PostMapping
    public ResponseEntity<UsuarioDTO> crear(@RequestBody Map<String, String> body) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setNombreCompleto(body.get("nombreCompleto"));
        dto.setRol(body.get("rol"));
        dto.setUsername(body.get("username"));
        return ResponseEntity.ok(usuarioService.crear(dto, body.get("password")));
    }

    /** Activa o desactiva el acceso de un usuario */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(
            @PathVariable Integer id, @RequestParam Boolean activo) {
        return ResponseEntity.ok(usuarioService.cambiarEstado(id, activo));
    }
}
