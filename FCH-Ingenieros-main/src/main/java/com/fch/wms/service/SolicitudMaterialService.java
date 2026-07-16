package com.fch.wms.service;

import com.fch.wms.dto.SolicitudMaterialDTO;
import com.fch.wms.entity.SolicitudMaterial;
import com.fch.wms.mapper.SolicitudMaterialMapper;
import com.fch.wms.payload.request.CrearSolicitudRequest;
import com.fch.wms.repository.SolicitudMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitudMaterialService {

    @Autowired private SolicitudMaterialRepository solicitudRepository;
    @Autowired private SolicitudMaterialMapper solicitudMapper;

    /** Listar todas las solicitudes (con filtro opcional por estado) */
    public List<SolicitudMaterialDTO> listarTodas(String estado) {
        List<SolicitudMaterial> lista = (estado != null && !estado.isBlank())
                ? solicitudRepository.findByEstadoSolicitud(estado)
                : solicitudRepository.findAll();
        return lista.stream().map(solicitudMapper::toDTO).collect(Collectors.toList());
    }

    /** Ver solicitudes de un personal de obra específico */
    public List<SolicitudMaterialDTO> listarPorPersonal(Integer idPersonal) {
        return solicitudRepository.findByIdPersonal(idPersonal).stream()
                .map(solicitudMapper::toDTO).collect(Collectors.toList());
    }

    public SolicitudMaterialDTO buscarPorId(Integer id) {
        SolicitudMaterial s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + id));
        return solicitudMapper.toDTO(s);
    }

    /**
     * El jefe de cuadrilla o personal de obra crea una solicitud.
     * Nace siempre en estado 'Pendiente'.
     */
    public SolicitudMaterialDTO crear(CrearSolicitudRequest request) {
        SolicitudMaterial s = new SolicitudMaterial();
        s.setIdPersonal(request.getIdPersonal());
        s.setSectorObra(request.getSectorObra());
        s.setFechaSolicitud(LocalDateTime.now());
        s.setEstadoSolicitud("Pendiente");
        return solicitudMapper.toDTO(solicitudRepository.save(s));
    }

    /**
     * El almacenero o residente aprueba la solicitud.
     * Solo se puede aprobar si está en estado 'Pendiente'.
     */
    public SolicitudMaterialDTO aprobar(Integer id) {
        SolicitudMaterial s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + id));
        if (!s.getEstadoSolicitud().equals("Pendiente")) {
            throw new RuntimeException("Solo se pueden aprobar solicitudes en estado 'Pendiente'");
        }
        s.setEstadoSolicitud("Aprobado");
        return solicitudMapper.toDTO(solicitudRepository.save(s));
    }

    /**
     * El almacenero o residente rechaza la solicitud.
     * Solo se puede rechazar si está en estado 'Pendiente'.
     */
    public SolicitudMaterialDTO rechazar(Integer id) {
        SolicitudMaterial s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + id));
        if (!s.getEstadoSolicitud().equals("Pendiente")) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes en estado 'Pendiente'");
        }
        s.setEstadoSolicitud("Rechazado");
        return solicitudMapper.toDTO(solicitudRepository.save(s));
    }
}
