package com.fch.wms.mapper;

import com.fch.wms.dto.MaterialDTO;
import com.fch.wms.entity.Material;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MaterialMapper {
    MaterialDTO toDTO(Material entity);
    Material toEntity(MaterialDTO dto);
}
