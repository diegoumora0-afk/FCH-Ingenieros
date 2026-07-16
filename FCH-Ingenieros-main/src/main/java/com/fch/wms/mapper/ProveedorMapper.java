package com.fch.wms.mapper;

import com.fch.wms.dto.ProveedorDTO;
import com.fch.wms.entity.Proveedor;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProveedorMapper {
    ProveedorDTO toDTO(Proveedor entity);
    Proveedor toEntity(ProveedorDTO dto);
}
