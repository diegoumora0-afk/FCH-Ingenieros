package com.fch.wms.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MovimientoDTO {
    private Integer idMovimiento;
    private String tipoMovimiento;
    private LocalDateTime fechaHora;
    private Integer idUsuario;
    private Integer idPersonal;
    private Integer idProyecto;
    private Integer idProveedor;
    private Integer idSolicitud;
    private String nroGuia;
    private String observaciones;
}
