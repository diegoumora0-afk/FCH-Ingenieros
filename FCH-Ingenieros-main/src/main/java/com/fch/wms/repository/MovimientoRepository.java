package com.fch.wms.repository;

import com.fch.wms.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Integer> {

    // Movimientos filtrados por proyecto y rango de fechas (para reportes)
    @Query("SELECT m FROM Movimiento m WHERE m.idProyecto = :idProyecto " +
           "AND m.fechaHora BETWEEN :fechaInicio AND :fechaFin")
    List<Movimiento> findByProyectoYFecha(
            @Param("idProyecto") Integer idProyecto,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    // Movimientos de tipo SALIDA filtrados por personal (consumo por cuadrilla)
    List<Movimiento> findByIdPersonalAndTipoMovimiento(
            Integer idPersonal, String tipoMovimiento);
}
