package com.hml.planat.mappers;

import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.vos.GroupUserVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GroupUserMappingMapper {
    int insert(@Param(value = "groupUserMapping") GroupUserMappingEntity groupUserMappingEntity);

    GroupUserVo[] selectGrantedUsersByGroupId(@Param(value = "groupId") int groupId);

    GroupUserVo[] selectPendingUsersByUserEmail(@Param(value = "userEmail") String userEmail);

    GroupUserVo[] selectReceivedByUserEmail(@Param(value = "userEmail") String userEmail);

    GroupUserVo[] selectActiveByUserEmail(@Param(value = "userEmail") String userEmail);

    int updateByGroupIdAndUserEmail(@Param(value = "groupUserMapping") GroupUserMappingEntity groupUserMapping);

    GroupUserMappingEntity selectByGroupIdAndUserEmail(@Param(value = "groupId") int groupId,
                                                       @Param(value = "userEmail") String userEmail);

    int deleteByGroupIdAndUserEmail(@Param(value = "groupId") int groupId,
                        @Param(value = "userEmail") String userEmail);

    GroupUserMappingEntity[] selectByGroupId(@Param(value = "groupId") int groupId);

}
