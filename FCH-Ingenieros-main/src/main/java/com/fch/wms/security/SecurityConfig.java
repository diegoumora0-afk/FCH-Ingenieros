package com.fch.wms.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig - El "plano de seguridad" de toda la aplicación.
 *
 * Define:
 * - Qué rutas son PÚBLICAS (no requieren token).
 * - Qué rutas son PRIVADAS (requieren un token válido).
 * - Qué tipo de sesión se usa (STATELESS: sin sesiones de servidor, solo JWT).
 * - El algoritmo de encriptación de contraseñas (BCrypt).
 *
 * MATRIZ DE ACCESO (basada en los roles del documento):
 * ┌─────────────────────────────┬──────────────────────────────┐
 * │ Ruta │ Acceso │
 * ├─────────────────────────────┼──────────────────────────────┤
 * │ POST /api/auth/** │ PÚBLICO (Login) │
 * │ GET /api/materiales/** │ Almacenero, Residente, Gerente│
 * │ POST /api/movimientos/** │ Almacenero │
 * │ GET /api/kardex/** │ Residente, Gerente │
 * │ GET /api/reportes/** │ Gerente │
 * └─────────────────────────────┴──────────────────────────────┘
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * Configura el BCryptPasswordEncoder.
     * Este Bean es el que usará el AuthService para hashear contraseñas
     * al crear usuarios y para comparar al hacer Login.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Conecta el CustomUserDetailsService con el BCryptPasswordEncoder.
     * Spring usará este proveedor para cargar el usuario desde la DB
     * y verificar la contraseña usando BCrypt automáticamente.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Expone el AuthenticationManager como Bean para poder inyectarlo
     * en el AuthService al momento de autenticar credenciales.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Define las reglas de seguridad HTTP:
     * - Desactiva CSRF (no necesario para APIs REST con JWT).
     * - Define las rutas públicas y privadas.
     * - Configura la política de sesión como STATELESS.
     * - Registra el JwtFilter ANTES del filtro de autenticación estándar de Spring.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Habilitar CORS para permitir peticiones desde el futuro frontend
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Desactivar CSRF (las APIs REST con JWT no lo necesitan)
                .csrf(csrf -> csrf.disable())

                // Reglas de autorización por ruta
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas: Login y registro
                        .requestMatchers("/api/auth/**").permitAll()

                        // Movimientos: solo el Almacenero puede registrar entradas/salidas
                        .requestMatchers("/api/movimientos/**")
                        .hasAnyRole("Almacenero", "Gerente")

                        // Kardex y reportes: Residente y Gerente pueden ver el historial
                        .requestMatchers("/api/kardex/**")
                        .hasAnyRole("Residente", "Gerente")

                        // Cualquier otra ruta requiere estar autenticado
                        .anyRequest().authenticated())

                // Sin sesiones de servidor: cada petición se valida solo con el token
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Agregar el JwtFilter antes del filtro de autenticación estándar
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración Global de CORS
     * Permite que el futuro frontend (por ejemplo en http://localhost:3000 o 5173)
     * se comunique con esta API sin bloqueos del navegador.
     */
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        // Permite cualquier origen temporalmente (se puede restringir en producción al
        // dominio del frontend)
        configuration.setAllowedOriginPatterns(java.util.List.of("*"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
