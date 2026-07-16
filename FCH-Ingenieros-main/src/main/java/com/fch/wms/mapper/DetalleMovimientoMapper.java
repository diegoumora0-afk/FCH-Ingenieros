package com.fch.wms.mapper;

import com.fch.wms.dto.DetalleMovimientoDTO;
import com.fch.wms.entity.DetalleMovimiento;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DetalleMovimientoMapper {
    DetalleMovimientoDTO toDTO(DetalleMovimiento entity);
    DetalleMovimiento toEntity(DetalleMovimientoDTO dto);

    List<DetalleMovimientoDTO> toDTOList(List<DetalleMovimiento> entities);
    List<DetalleMovimiento> toEntityList(List<DetalleMovimientoDTO> dtos);
}
