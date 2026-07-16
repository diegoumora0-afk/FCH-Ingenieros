package com.fch.wms.repository;

import com.fch.wms.entity.DetalleMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleMovimientoRepository extends JpaRepository<DetalleMovimiento, Integer> {
    List<DetalleMovimiento> findByIdMovimiento(Integer idMovimiento);
}
