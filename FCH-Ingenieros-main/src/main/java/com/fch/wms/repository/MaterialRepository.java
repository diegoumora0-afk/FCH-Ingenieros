package com.fch.wms.repository;

import com.fch.wms.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Integer> {

    // Búsqueda por nombre o SKU (case-insensitive)
    List<Material> findByNombreContainingIgnoreCaseOrCodigoSkuContainingIgnoreCase(
            String nombre, String codigoSku);

    // Materiales con stock actual <= stock mínimo (alertas de reposición)
    @Query("SELECT m FROM Material m WHERE m.stockActual <= m.stockMinimo")
    List<Material> findByStockActualLessThanEqual();
}
