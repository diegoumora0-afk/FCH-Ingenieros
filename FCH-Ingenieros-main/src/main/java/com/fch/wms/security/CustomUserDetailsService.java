package com.fch.wms.security;

import com.fch.wms.entity.Usuario;
import com.fch.wms.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CustomUserDetailsService - Puente entre Spring Security y la base de datos.
 *
 * Spring Security necesita saber cómo cargar un usuario desde la DB para
 * poder comparar la contraseña ingresada contra el hash almacenado.
 * Este servicio lo hace buscando al usuario por su username en la tabla Usuarios.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Buscar el usuario en la base de datos por su username
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username));

        // Verificar que la cuenta esté activa
        if (!usuario.getEstado()) {
            throw new UsernameNotFoundException("Usuario desactivado: " + username);
        }

        // Construir el objeto UserDetails que Spring Security entiende,
        // asignándole el rol con prefijo "ROLE_" (requerido por Spring)
        return new User(
                usuario.getUsername(),
                usuario.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol()))
        );
    }
}
