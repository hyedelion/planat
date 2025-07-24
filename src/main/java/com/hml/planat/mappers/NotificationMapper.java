package com.hml.planat.mappers;

import com.hml.planat.entities.NotificationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NotificationMapper {
    int insert(@Param(value = "notification")NotificationEntity notification);

    NotificationEntity[] selectAllByTargetUserEmail(@Param(value = "targetUserEmail") String targetUserEmail);

    int update(@Param(value = "notification")NotificationEntity notification);

    NotificationEntity selectById(@Param(value = "id") int id);

    int deleteById(@Param(value = "id") int id);
}
