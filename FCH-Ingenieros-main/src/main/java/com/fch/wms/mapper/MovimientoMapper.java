package com.fch.wms.mapper;

import com.fch.wms.dto.MovimientoDTO;
import com.fch.wms.entity.Movimiento;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MovimientoMapper {
    MovimientoDTO toDTO(Movimiento entity);
    Movimiento toEntity(MovimientoDTO dto);
}
