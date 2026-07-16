package com.fch.wms.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Integer idUsuario;
    private String nombreCompleto;
    private String rol;
    private String username;
    // No se suele exponer el passwordHash en el DTO
    private Boolean estado;
}
