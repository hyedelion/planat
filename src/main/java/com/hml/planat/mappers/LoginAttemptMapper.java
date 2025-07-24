package com.hml.planat.mappers;

import com.hml.planat.entities.users.LoginAttemptEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LoginAttemptMapper {

    int insert(@Param(value = "loginAttempt") LoginAttemptEntity loginAttempt);


}
