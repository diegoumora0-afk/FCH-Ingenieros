package com.fch.wms.service;

import com.fch.wms.dto.ProveedorDTO;
import com.fch.wms.entity.Proveedor;
import com.fch.wms.mapper.ProveedorMapper;
import com.fch.wms.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorService {

    @Autowired private ProveedorRepository proveedorRepository;
    @Autowired private ProveedorMapper proveedorMapper;

    public List<ProveedorDTO> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(proveedorMapper::toDTO).collect(Collectors.toList());
    }

    public ProveedorDTO buscarPorId(Integer id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado: " + id));
        return proveedorMapper.toDTO(p);
    }

    public ProveedorDTO crear(ProveedorDTO dto) {
        Proveedor p = proveedorMapper.toEntity(dto);
        p.setIdProveedor(null);
        return proveedorMapper.toDTO(proveedorRepository.save(p));
    }

    public ProveedorDTO actualizar(Integer id, ProveedorDTO dto) {
        proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado: " + id));
        Proveedor p = proveedorMapper.toEntity(dto);
        p.setIdProveedor(id);
        return proveedorMapper.toDTO(proveedorRepository.save(p));
    }
}
