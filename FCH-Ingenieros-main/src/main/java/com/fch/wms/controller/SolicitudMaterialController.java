package com.fch.wms.controller;

import com.fch.wms.dto.SolicitudMaterialDTO;
import com.fch.wms.payload.request.CrearSolicitudRequest;
import com.fch.wms.service.SolicitudMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SolicitudMaterialController
 * BASE URL: /api/solicitudes
 *
 * GET  /api/solicitudes?estado=Pendiente   → Listar (filtro opcional)
 * GET  /api/solicitudes/{id}               → Ver detalle
 * GET  /api/solicitudes/personal/{id}      → Ver solicitudes de un personal
 * POST /api/solicitudes                    → Crear solicitud (cuadrilla)
 * PUT  /api/solicitudes/{id}/aprobar       → Aprobar (almacenero/residente)
 * PUT  /api/solicitudes/{id}/rechazar      → Rechazar (almacenero/residente)
 */
@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudMaterialController {

    @Autowired private SolicitudMaterialService solicitudService;

    @GetMapping
    public ResponseEntity<List<SolicitudMaterialDTO>> listarTodas(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(solicitudService.listarTodas(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudMaterialDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(solicitudService.buscarPorId(id));
    }

    @GetMapping("/personal/{idPersonal}")
    public ResponseEntity<List<SolicitudMaterialDTO>> listarPorPersonal(
            @PathVariable Integer idPersonal) {
        return ResponseEntity.ok(solicitudService.listarPorPersonal(idPersonal));
    }

    @PostMapping
    public ResponseEntity<SolicitudMaterialDTO> crear(
            @RequestBody CrearSolicitudRequest request) {
        return ResponseEntity.ok(solicitudService.crear(request));
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudMaterialDTO> aprobar(@PathVariable Integer id) {
        return ResponseEntity.ok(solicitudService.aprobar(id));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudMaterialDTO> rechazar(@PathVariable Integer id) {
        return ResponseEntity.ok(solicitudService.rechazar(id));
    }
}
