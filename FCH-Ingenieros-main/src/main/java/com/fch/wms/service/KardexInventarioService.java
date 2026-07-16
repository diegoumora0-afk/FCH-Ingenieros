package com.fch.wms.service;

import com.fch.wms.dto.KardexInventarioDTO;
import com.fch.wms.mapper.KardexInventarioMapper;
import com.fch.wms.repository.KardexInventarioRepository;
import com.fch.wms.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * KardexInventarioService - Solo lectura.
 * Permite a la Gerencia y Residencia auditar el historial
 * matemático de cualquier material (saldo inicial → movimiento → saldo final).
 */
@Service
public class KardexInventarioService {

    @Autowired private KardexInventarioRepository kardexRepository;
    @Autowired private KardexInventarioMapper kardexMapper;
    @Autowired private MaterialRepository materialRepository;

    /**
     * Devuelve el historial completo de un material ordenado cronológicamente.
     * Permite ver exactamente cómo cambió el stock a lo largo del tiempo.
     */
    public List<KardexInventarioDTO> obtenerPorMaterial(Integer idMaterial) {
        // Verificar que el material existe
        materialRepository.findById(idMaterial)
                .orElseThrow(() -> new RuntimeException("Material no encontrado: " + idMaterial));

        return kardexRepository
                .findByIdMaterialOrderByFechaRegistroAsc(idMaterial)
                .stream()
                .map(kardexMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Listar todos los registros de Kardex (para auditoría global) */
    public List<KardexInventarioDTO> listarTodos() {
        return kardexRepository.findAll().stream()
                .map(kardexMapper::toDTO)
                .collect(Collectors.toList());
    }
}
