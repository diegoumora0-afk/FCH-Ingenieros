package com.fch.wms.mapper;

import com.fch.wms.dto.ProyectoDTO;
import com.fch.wms.entity.Proyecto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProyectoMapper {
    ProyectoDTO toDTO(Proyecto entity);
    Proyecto toEntity(ProyectoDTO dto);
}
