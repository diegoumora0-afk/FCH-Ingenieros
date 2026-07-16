package com.fch.wms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialDTO {
    private Integer idMaterial;
    private String codigoSku;
    private String nombre;
    private String categoria;
    private String unidadMedida;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
}
