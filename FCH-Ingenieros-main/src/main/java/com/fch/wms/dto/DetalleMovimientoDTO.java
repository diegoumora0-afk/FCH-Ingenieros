package com.fch.wms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleMovimientoDTO {
    private Integer idDetalle;
    private Integer idMovimiento;
    private Integer idMaterial;
    private BigDecimal cantidad;
}
