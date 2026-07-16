package com.fch.wms.dto;

import lombok.Data;

@Data
public class ProyectoDTO {
    private Integer idProyecto;
    private String nombreProyecto;
    private String ubicacion;
    private String estado;
}
