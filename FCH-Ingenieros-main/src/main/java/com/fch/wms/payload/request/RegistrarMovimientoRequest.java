package com.fch.wms.payload.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * RegistrarMovimientoRequest - Payload para registrar una ENTRADA o SALIDA de materiales.
 *
 * Un solo request puede contener múltiples materiales (detalles).
 *
 * JSON para ENTRADA (material de proveedor):
 * {
 *   "tipoMovimiento": "ENTRADA",
 *   "idUsuario": 1,
 *   "idProyecto": 1,
 *   "idProveedor": 3,
 *   "nroGuia": "GR-001-00012",
 *   "observaciones": "Llegó en buen estado",
 *   "detalles": [
 *     { "idMaterial": 10, "cantidad": 500.0 },
 *     { "idMaterial": 15, "cantidad": 50.0 }
 *   ]
 * }
 *
 * JSON para SALIDA (despacho a cuadrilla):
 * {
 *   "tipoMovimiento": "SALIDA",
 *   "idUsuario": 1,
 *   "idPersonal": 7,
 *   "idProyecto": 1,
 *   "idSolicitud": 4,
 *   "observaciones": "Entregado al jefe Quispe - Sector A",
 *   "detalles": [
 *     { "idMaterial": 10, "cantidad": 100.0 }
 *   ]
 * }
 */
@Data
public class RegistrarMovimientoRequest {

    private String tipoMovimiento;   // "ENTRADA" o "SALIDA"
    private Integer idUsuario;       // Almacenero que registra la operación
    private Integer idPersonal;      // Solo para SALIDA: quién recibe el material
    private Integer idProyecto;      // Proyecto al que se carga el costo
    private Integer idProveedor;     // Solo para ENTRADA: de dónde viene
    private Integer idSolicitud;     // Solo para SALIDA: solicitud previa aprobada
    private String nroGuia;          // Número de guía de remisión
    private String observaciones;
    private List<DetalleRequest> detalles;

    @Data
    public static class DetalleRequest {
        private Integer idMaterial;
        private BigDecimal cantidad;
    }
}
