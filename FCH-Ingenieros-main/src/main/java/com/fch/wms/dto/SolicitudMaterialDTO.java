package com.fch.wms.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SolicitudMaterialDTO {
    private Integer idSolicitud;
    private LocalDateTime fechaSolicitud;
    private Integer idPersonal;
    private String sectorObra;
    private String estadoSolicitud;
}
