package com.fch.wms.service;

import com.fch.wms.dto.MaterialDTO;
import com.fch.wms.entity.Material;
import com.fch.wms.mapper.MaterialMapper;
import com.fch.wms.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialMapper materialMapper;

    /** Listar todos los materiales */
    public List<MaterialDTO> listarTodos() {
        return materialRepository.findAll()
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Buscar por ID */
    public MaterialDTO buscarPorId(Integer id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        return materialMapper.toDTO(material);
    }

    /** Buscar por nombre o código SKU (para el buscador del almacenero) */
    public List<MaterialDTO> buscar(String termino) {
        return materialRepository
                .findByNombreContainingIgnoreCaseOrCodigoSkuContainingIgnoreCase(termino, termino)
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Listar materiales con stock por debajo del mínimo (alerta de reposición) */
    public List<MaterialDTO> listarBajoStockMinimo() {
        return materialRepository.findByStockActualLessThanEqual()
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Crear nuevo material en el catálogo */
    public MaterialDTO crear(MaterialDTO dto) {
        Material material = materialMapper.toEntity(dto);
        material.setIdMaterial(null); // Asegurar que sea nuevo
        return materialMapper.toDTO(materialRepository.save(material));
    }

    /** Actualizar datos de un material existente */
    public MaterialDTO actualizar(Integer id, MaterialDTO dto) {
        // Verificar que existe antes de actualizar
        materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        Material material = materialMapper.toEntity(dto);
        material.setIdMaterial(id);
        return materialMapper.toDTO(materialRepository.save(material));
    }

    /** Eliminar un material existente */
    public void eliminar(Integer id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
        materialRepository.delete(material);
    }
}
