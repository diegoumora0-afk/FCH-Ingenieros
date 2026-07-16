package com.fch.wms.service;

import com.fch.wms.dto.PersonalObraDTO;
import com.fch.wms.entity.PersonalObra;
import com.fch.wms.mapper.PersonalObraMapper;
import com.fch.wms.repository.PersonalObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonalObraService {

    @Autowired private PersonalObraRepository personalObraRepository;
    @Autowired private PersonalObraMapper personalObraMapper;

    public List<PersonalObraDTO> listarTodos() {
        return personalObraRepository.findAll().stream()
                .map(personalObraMapper::toDTO).collect(Collectors.toList());
    }

    public PersonalObraDTO buscarPorId(Integer id) {
        PersonalObra p = personalObraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado: " + id));
        return personalObraMapper.toDTO(p);
    }

    public PersonalObraDTO crear(PersonalObraDTO dto) {
        PersonalObra p = personalObraMapper.toEntity(dto);
        p.setIdPersonal(null);
        return personalObraMapper.toDTO(personalObraRepository.save(p));
    }

    public PersonalObraDTO actualizar(Integer id, PersonalObraDTO dto) {
        personalObraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado: " + id));
        PersonalObra p = personalObraMapper.toEntity(dto);
        p.setIdPersonal(id);
        return personalObraMapper.toDTO(personalObraRepository.save(p));
    }
}
