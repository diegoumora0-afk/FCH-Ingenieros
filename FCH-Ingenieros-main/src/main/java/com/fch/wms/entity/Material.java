package com.fch.wms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "materiales")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMaterial;
    private String codigoSku;
    private String nombre;
    private String categoria;
    private String unidadMedida;
    private java.math.BigDecimal stockActual;
    private java.math.BigDecimal stockMinimo;
}
