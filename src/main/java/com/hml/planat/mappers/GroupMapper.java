package com.hml.planat.mappers;

import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.users.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GroupMapper {
    GroupEntity[] selectAllByUserEmail(String userEmail);

    int insert(@Param(value = "group") GroupEntity group);

    int update(@Param(value = "group")  GroupEntity group);

    int delete(@Param(value = "id") int id);

    GroupEntity selectById(@Param(value = "id") int id);
}
