package com.fch.wms.repository;

import com.fch.wms.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Spring Data JPA genera la query SQL automáticamente desde el nombre del método
    Optional<Usuario> findByUsername(String username);
}
