package com.hml.planat.mappers;

import com.hml.planat.entities.users.ContactMvnoEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ContactMvnoMapper {
    ContactMvnoEntity[] selectAll();
}
