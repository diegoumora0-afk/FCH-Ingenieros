package com.fch.wms.mapper;

import com.fch.wms.dto.KardexInventarioDTO;
import com.fch.wms.entity.KardexInventario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface KardexInventarioMapper {
    KardexInventarioDTO toDTO(KardexInventario entity);
    KardexInventario toEntity(KardexInventarioDTO dto);
}
