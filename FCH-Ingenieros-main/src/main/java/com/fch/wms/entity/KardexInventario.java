package com.fch.wms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "kardex_inventario")
public class KardexInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idKardex;
    private Integer idMaterial;
    private Integer idMovimiento;
    private LocalDateTime fechaRegistro;
    private BigDecimal saldoInicial;
    private BigDecimal ingreso;
    private BigDecimal salida;
    private BigDecimal saldoFinal;
}
