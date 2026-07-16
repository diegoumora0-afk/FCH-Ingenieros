package com.fch.wms.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class KardexInventarioDTO {
    private Integer idKardex;
    private Integer idMaterial;
    private Integer idMovimiento;
    private LocalDateTime fechaRegistro;
    private BigDecimal saldoInicial;
    private BigDecimal ingreso;
    private BigDecimal salida;
    private BigDecimal saldoFinal;
}
