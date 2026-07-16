package com.fch.wms.service;

import com.fch.wms.dto.ProyectoDTO;
import com.fch.wms.entity.Proyecto;
import com.fch.wms.mapper.ProyectoMapper;
import com.fch.wms.repository.ProyectoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProyectoService {

    @Autowired private ProyectoRepository proyectoRepository;
    @Autowired private ProyectoMapper proyectoMapper;

    public List<ProyectoDTO> listarTodos() {
        return proyectoRepository.findAll().stream()
                .map(proyectoMapper::toDTO).collect(Collectors.toList());
    }

    public ProyectoDTO buscarPorId(Integer id) {
        Proyecto p = proyectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado: " + id));
        return proyectoMapper.toDTO(p);
    }

    public ProyectoDTO crear(ProyectoDTO dto) {
        Proyecto p = proyectoMapper.toEntity(dto);
        p.setIdProyecto(null);
        return proyectoMapper.toDTO(proyectoRepository.save(p));
    }

    public ProyectoDTO actualizar(Integer id, ProyectoDTO dto) {
        proyectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado: " + id));
        Proyecto p = proyectoMapper.toEntity(dto);
        p.setIdProyecto(id);
        return proyectoMapper.toDTO(proyectoRepository.save(p));
    }
}
