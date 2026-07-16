package com.fch.wms.service;

import com.fch.wms.entity.Usuario;
import com.fch.wms.payload.request.LoginRequest;
import com.fch.wms.payload.response.LoginResponse;
import com.fch.wms.repository.UsuarioRepository;
import com.fch.wms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService - Lógica de negocio para la autenticación.
 *
 * FLUJO de un Login exitoso:
 * 1. Recibe el LoginRequest (username + password en texto plano).
 * 2. Delega la verificación al AuthenticationManager de Spring.
 *    → Spring internamente llama a CustomUserDetailsService.loadUserByUsername()
 *    → Luego compara la password con el hash usando BCrypt.
 * 3. Si el hash coincide (autenticación exitosa):
 *    → Busca los datos del usuario en la DB (nombre, rol).
 *    → Genera el token JWT con JwtUtil.
 *    → Devuelve el LoginResponse con el token y datos del usuario.
 * 4. Si no coincide: Spring lanza una AuthenticationException → el controlador devuelve 401.
 */
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Autentica las credenciales y genera el token JWT.
     * @param request LoginRequest con username y password.
     * @return LoginResponse con el token y datos del usuario.
     * @throws AuthenticationException si las credenciales son incorrectas.
     */
    public LoginResponse login(LoginRequest request) {
        // 1. Spring verifica username + password contra el hash en la DB
        //    Si falla, lanza BadCredentialsException automáticamente
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Autenticación exitosa: obtener datos completos del usuario desde la DB
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Generar el token JWT con el username y el rol del usuario
        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol());

        // 4. Construir y devolver la respuesta con el token
        return new LoginResponse(
                token,
                usuario.getUsername(),
                usuario.getRol(),
                usuario.getNombreCompleto()
        );
    }

    /**
     * Encripta una contraseña usando BCrypt.
     * Método de utilidad para crear usuarios en la DB con contraseña segura.
     * @param rawPassword Contraseña en texto plano.
     * @return Hash BCrypt listo para guardar en la columna password_hash.
     */
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
