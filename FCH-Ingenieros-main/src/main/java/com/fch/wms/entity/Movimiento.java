package com.fch.wms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movimientos")
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
