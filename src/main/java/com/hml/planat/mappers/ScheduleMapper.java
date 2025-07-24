package com.hml.planat.mappers;

import com.hml.planat.entities.schedules.ScheduleEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

@Mapper
public interface ScheduleMapper {
    int insert(@Param(value = "schedule") ScheduleEntity schedule);

    ScheduleEntity[] selectAll(@Param(value = "userEmail") String userEmail,
                               @Param(value = "from") LocalDateTime from,
                               @Param(value = "to") LocalDateTime to);

    ScheduleEntity selectById(@Param(value = "id") int id);

    ScheduleEntity selectByIdAndUserEmail(@Param(value = "id") int id,
                                     @Param(value = "userEmail") String userEmail);

    int delete(@Param(value = "schedule") ScheduleEntity schedule);

    int update(@Param(value = "schedule") ScheduleEntity schedule);
}
