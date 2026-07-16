package com.fch.wms.mapper;

import com.fch.wms.dto.SolicitudMaterialDTO;
import com.fch.wms.entity.SolicitudMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SolicitudMaterialMapper {
    SolicitudMaterialDTO toDTO(SolicitudMaterial entity);
    SolicitudMaterial toEntity(SolicitudMaterialDTO dto);
}
