package com.hml.planat.mappers;

import com.hml.planat.entities.users.FriendEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.vos.FriendVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FriendMapper {
    int insert(@Param(value = "friend") FriendEntity friend);

    int update(@Param(value = "friend") FriendEntity friend);

    int delete(@Param(value = "requesterUserEmail") String requesterUserEmail,
               @Param(value = "requesteeUserEmail") String requesteeUserEmail);

    FriendEntity selectByRequesterAndUserEmail(@Param(value = "requesterUserEmail") String requesterUserEmail,
                                               @Param(value = "requesteeUserEmail") String requesteeUserEmail);

    FriendVo[] selectFriendRequestByRequesterEmail(@Param(value = "requesterUserEmail") String requesterUserEmail);

    FriendVo[] selectFriendRequestByRequesteeEmail(@Param(value = "requesteeUserEmail") String requesteeUserEmail);

    FriendVo[] selectAllFriendsByUserEmail(@Param(value = "userEmail") String userEmail);

    FriendVo selectByFriendEmail(@Param(value = "friendEmail") String friendEmail);

    int deleteRelationshipByFriendEmail(@Param(value = "friendEmail") String friendEmail);
}
