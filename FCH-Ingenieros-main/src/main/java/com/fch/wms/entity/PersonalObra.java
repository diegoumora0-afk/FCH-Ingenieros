package com.fch.wms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "personal_obra")
public class PersonalObra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPersonal;
    private String dni;
    private String nombres;
    private String apellidos;
    private String cargo;
}
