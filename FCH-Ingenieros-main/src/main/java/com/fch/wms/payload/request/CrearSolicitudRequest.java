package com.fch.wms.payload.request;

import lombok.Data;

/**
 * CrearSolicitudRequest - Payload para que el jefe de cuadrilla pida materiales.
 *
 * JSON esperado:
 * {
 *   "idPersonal": 5,
 *   "sectorObra": "Sector A - Manzana 12"
 * }
 */
@Data
public class CrearSolicitudRequest {
    private Integer idPersonal;
    private String sectorObra;
}
