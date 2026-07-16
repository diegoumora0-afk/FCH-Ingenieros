package com.fch.wms.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * LoginResponse - Lo que el servidor devuelve tras un Login exitoso.
 *
 * El Frontend recibirá un JSON con este formato:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiJ9...",
 *   "username": "almacenero01",
 *   "rol": "Almacenero",
 *   "nombreCompleto": "Juan Quispe Flores"
 * }
 *
 * El token debe guardarse en la app (localStorage o memoria segura)
 * y enviarse en cada petición posterior en el header:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
 */
@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String rol;
    private String nombreCompleto;
}
