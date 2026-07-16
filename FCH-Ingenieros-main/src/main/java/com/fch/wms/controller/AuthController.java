package com.fch.wms.controller;

import com.fch.wms.payload.request.LoginRequest;
import com.fch.wms.payload.response.LoginResponse;
import com.fch.wms.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController - Expone los endpoints públicos de autenticación.
 *
 * BASE URL: /api/auth
 *
 * Endpoints:
 * ┌─────────────────────────────┬──────────┬──────────────────────────────────────┐
 * │ Endpoint │ Método │ Descripción │
 * ├─────────────────────────────┼──────────┼──────────────────────────────────────┤
 * │ /api/auth/login │ POST │ Autenticar usuario, devolver JWT │
 * └─────────────────────────────┴──────────┴──────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permitir llamadas desde la App Móvil y el Frontend
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/login
     *
     * BODY esperado (JSON):
     * {
     * "username": "almacenero01",
     * "password": "mi_contraseña"
     * }
     *
     * RESPUESTA exitosa (200 OK):
     * {
     * "token": "eyJhbGciOiJIUzI1NiJ9...",
     * "username": "almacenero01",
     * "rol": "Almacenero",
     * "nombreCompleto": "Juan Quispe Flores"
     * }
     *
     * RESPUESTA fallida (401 Unauthorized):
     * {
     * "error": "Credenciales incorrectas"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            // BCrypt comparó y los hashes no coincidieron, o el usuario no existe
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas"));
        }
    }
}
