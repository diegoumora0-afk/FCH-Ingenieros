package com.fch.wms.mapper;

import com.fch.wms.dto.PersonalObraDTO;
import com.fch.wms.entity.PersonalObra;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PersonalObraMapper {
    PersonalObraDTO toDTO(PersonalObra entity);
    PersonalObra toEntity(PersonalObraDTO dto);
}
