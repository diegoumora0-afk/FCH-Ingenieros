package com.fch.wms.dto;

import lombok.Data;

@Data
public class PersonalObraDTO {
    private Integer idPersonal;
    private String dni;
    private String nombres;
    private String apellidos;
    private String cargo;
}
