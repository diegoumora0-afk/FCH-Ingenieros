package com.fch.wms.service;

import com.fch.wms.dto.UsuarioDTO;
import com.fch.wms.entity.Usuario;
import com.fch.wms.mapper.UsuarioMapper;
import com.fch.wms.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private UsuarioMapper usuarioMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDTO).collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(Integer id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
        return usuarioMapper.toDTO(u);
    }

    /**
     * Crea un nuevo usuario encriptando su contraseña con BCrypt.
     * El campo 'username' en el DTO se usa como contraseña temporal inicial.
     * En producción se recibiría un campo 'password' en un Request separado.
     */
    public UsuarioDTO crear(UsuarioDTO dto, String rawPassword) {
        Usuario u = usuarioMapper.toEntity(dto);
        u.setIdUsuario(null);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setEstado(true);
        return usuarioMapper.toDTO(usuarioRepository.save(u));
    }

    /** Activar o desactivar acceso al sistema */
    public UsuarioDTO cambiarEstado(Integer id, Boolean estado) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
        u.setEstado(estado);
        return usuarioMapper.toDTO(usuarioRepository.save(u));
    }
}
