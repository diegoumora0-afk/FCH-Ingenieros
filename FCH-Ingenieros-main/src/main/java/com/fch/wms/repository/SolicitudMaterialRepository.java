package com.fch.wms.repository;

import com.fch.wms.entity.SolicitudMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudMaterialRepository extends JpaRepository<SolicitudMaterial, Integer> {

    // Filtrar por estado: 'Pendiente', 'Aprobado', 'Rechazado'
    List<SolicitudMaterial> findByEstadoSolicitud(String estadoSolicitud);

    // Ver solicitudes de un personal específico
    List<SolicitudMaterial> findByIdPersonal(Integer idPersonal);
}
