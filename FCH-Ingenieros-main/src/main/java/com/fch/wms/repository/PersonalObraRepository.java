package com.fch.wms.repository;

import com.fch.wms.entity.PersonalObra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonalObraRepository extends JpaRepository<PersonalObra, Integer> {
}
