package com.fch.wms.repository;

import com.fch.wms.entity.KardexInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KardexInventarioRepository extends JpaRepository<KardexInventario, Integer> {
    // Historial completo de un material ordenado cronológicamente
    List<KardexInventario> findByIdMaterialOrderByFechaRegistroAsc(Integer idMaterial);
}
