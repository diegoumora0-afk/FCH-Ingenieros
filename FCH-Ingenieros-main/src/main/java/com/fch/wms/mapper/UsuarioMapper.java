package com.fch.wms.mapper;

import com.fch.wms.dto.UsuarioDTO;
import com.fch.wms.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UsuarioMapper {
    UsuarioDTO toDTO(Usuario entity);

    @Mapping(target = "passwordHash", ignore = true)
    Usuario toEntity(UsuarioDTO dto);
}
