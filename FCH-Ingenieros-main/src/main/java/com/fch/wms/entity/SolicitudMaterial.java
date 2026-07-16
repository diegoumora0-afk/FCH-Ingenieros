package com.fch.wms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "solicitudes_material")
public class SolicitudMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idSolicitud;
    private LocalDateTime fechaSolicitud;
    private Integer idPersonal;
    private String sectorObra;
    private String estadoSolicitud;
}
