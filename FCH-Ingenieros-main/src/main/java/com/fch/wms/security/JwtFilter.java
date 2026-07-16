package com.fch.wms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtFilter - Intercepta CADA petición HTTP que llega al servidor.
 *
 * FLUJO por cada petición:
 * 1. Lee el header "Authorization: Bearer <token>".
 * 2. Si existe el token, lo valida con JwtUtil.
 * 3. Si es válido, extrae el usuario y el rol, y los registra
 *    en el SecurityContext de Spring (le dice "esta petición ya fue autenticada").
 * 4. Si no existe token o es inválido, no hace nada → Spring Security
 *    bloqueará la petición si la ruta requiere autenticación.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Leer el header de autorización
        String authHeader = request.getHeader("Authorization");

        // 2. Verificar que el header existe y tiene el formato "Bearer <token>"
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Extraer el token sin "Bearer "

            // 3. Validar el token
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                String rol = jwtUtil.extractRol(token);

                // 4. Construir el objeto de autenticación de Spring con el rol del usuario
                //    El prefijo "ROLE_" es requerido por Spring Security para la autorización
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null, // Sin credenciales (el token ya es la prueba)
                                List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                        );

                // 5. Registrar la autenticación en el contexto de esta petición
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Dejar pasar la petición al siguiente filtro o al controlador
        filterChain.doFilter(request, response);
    }
}
