package com.hml.planat.mappers;

import com.hml.planat.entities.users.UserTrackEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserTrackMapper {
    int insert(@Param(value = "userTrack") UserTrackEntity userTrack);

    UserTrackEntity selectByUserEmail(@Param(value = "userEmail") String userEmail);
}