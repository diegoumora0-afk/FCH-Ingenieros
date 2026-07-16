package com.fch.wms.payload.request;

import lombok.Data;

/**
 * LoginRequest - Objeto que recibe el controlador al hacer Login.
 *
 * El Frontend o App Móvil enviará un JSON con este formato:
 * {
 *   "username": "almacenero01",
 *   "password": "mi_contraseña"
 * }
 *
 * IMPORTANTE: La contraseña viaja en texto plano sobre HTTPS.
 * El servidor la compara contra el hash almacenado usando BCrypt.
 * Nunca se guarda ni se devuelve la contraseña en texto plano.
 */
@Data
public class LoginRequest {
    private String username;
    private String password;
}
