package com.fch.wms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JwtUtil - Motor de generación y validación de Tokens JWT.
 *
 * FLUJO:
 * 1. Al hacer Login → generateToken(username, rol) → devuelve un token firmado.
 * 2. En cada petición → validateToken(token) verifica que sea auténtico y no haya expirado.
 * 3. Si es válido → extractUsername(token) devuelve quién es para buscarlo en la DB.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // En milisegundos (86400000 = 24 horas)

    /**
     * Genera la llave criptográfica a partir del secreto configurado.
     * Usamos HMAC-SHA256 como algoritmo de firma.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Crea y firma un nuevo Token JWT.
     * @param username El nombre de usuario (será el "subject" del token).
     * @param rol El rol del usuario (Almacenero, Residente, Gerente). Se guarda como "claim".
     * @return String con el token JWT firmado.
     */
    public String generateToken(String username, String rol) {
        return Jwts.builder()
                .setSubject(username)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae el username del Token.
     * @param token El token JWT recibido desde la App Móvil o Web.
     * @return El username guardado en el "subject" del token.
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extrae el rol del Token (útil para validar permisos en servicios específicos).
     * @param token El token JWT.
     * @return El rol del usuario (ej: 'Almacenero').
     */
    public String extractRol(String token) {
        return (String) parseClaims(token).get("rol");
    }

    /**
     * Valida si un token es auténtico y no está expirado.
     * Lanza excepciones específicas si el token fue manipulado o venció.
     * @param token El token JWT recibido.
     * @return true si el token es válido.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("Token no soportado: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("Token malformado: " + e.getMessage());
        } catch (SignatureException e) {
            System.out.println("Firma inválida: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("Token vacío o nulo: " + e.getMessage());
        }
        return false;
    }

    /**
     * Método privado que parsea y verifica la firma del token.
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
