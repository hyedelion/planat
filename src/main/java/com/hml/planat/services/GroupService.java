package com.hml.planat.services;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.GroupMapper;
import com.hml.planat.mappers.GroupUserMappingMapper;
import com.hml.planat.mappers.NotificationMapper;
import com.hml.planat.mappers.UserMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.vos.GroupUserVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class GroupService {
    private final GroupMapper groupMapper;
    private final GroupUserMappingMapper groupUserMappingMapper;
    private final UserMapper userMapper;
    private final NotificationMapper notificationMapper;

    @Autowired
    public GroupService(GroupMapper groupMapper, GroupUserMappingMapper groupUserMappingMapper, UserMapper userMapper, NotificationMapper notificationMapper) {
        this.groupMapper = groupMapper;
        this.groupUserMappingMapper = groupUserMappingMapper;
        this.userMapper = userMapper;
        this.notificationMapper = notificationMapper;
    }

    public ResultTuple<GroupUserVo[]> getActiveByUserEmail(String userEmail) {
        if (userEmail == null) {
            return ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<GroupUserVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.groupUserMappingMapper.selectActiveByUserEmail(userEmail))
                .build();
    }

    public Result addGroupUser(UserEntity signedUser, int groupId, String email, String nickname) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(groupId);
        if (dbGroup == null || !dbGroup.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        UserEntity user;
        if (email == null) {
             user = this.userMapper.selectByNickname(nickname);
        } else {
             user = this.userMapper.selectByEmail(email);
        }
        if (user == null){
            return CommonResult.FAILURE_NOT_FOUND;
        }
        if (user.equals(signedUser)) {
            return CommonResult.FAILURE_SELF;
        }
        GroupUserMappingEntity groupUserMapping = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, user.getEmail());
        if (groupUserMapping != null) {
            return CommonResult.FAILURE_DUPLICATE;
        }
        groupUserMapping = GroupUserMappingEntity.builder()
                .groupId(groupId)
                .userEmail(user.getEmail())
                .isAccepted(false)
                .createdAt(LocalDateTime.now())
                .build();
        GroupEntity group = this.groupMapper.selectById(groupId);
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(user.getEmail());
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 [%s] 그룹에 초대 요청을 보냈습니다.", signedUser.getNickname(), group.getName()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        return this.groupUserMappingMapper.insert(groupUserMapping) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result deleteGroupUser(UserEntity signedUser, int groupId, String email) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        if (signedUser.getEmail().equals(email)) {
            return CommonResult.FAILURE_SELF;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(groupId);
        if (dbGroup == null || !dbGroup.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        GroupUserMappingEntity dbGroupUser = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, email);
        if (dbGroupUser == null) {
            return CommonResult.FAILURE;
        }
        return this.groupUserMappingMapper.deleteByGroupIdAndUserEmail(dbGroupUser.getGroupId(), email) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result withdrawGroup(UserEntity signedUser, int groupId) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(groupId);
        if (dbGroup == null) {
            return CommonResult.FAILURE;
        }
        if (dbGroup.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE_SELF;
        }
        GroupUserMappingEntity dbGroupUser = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, signedUser.getEmail());
        if (dbGroupUser == null) {
            return CommonResult.FAILURE;
        }
        return this.groupUserMappingMapper.deleteByGroupIdAndUserEmail(groupId, signedUser.getEmail()) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result addGroup(UserEntity signedUser, GroupEntity group) {
        if (signedUser == null) {
            return CommonResult.FAILURE;
        }
        group.setUserEmail(signedUser.getEmail());
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        if (this.groupMapper.insert(group) == 0) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity groupUser = GroupUserMappingEntity.builder()
                .groupId(group.getId())
                .userEmail(signedUser.getEmail())
                .isAccepted(true)
                .createdAt(LocalDateTime.now())
                .build();
        return this.groupUserMappingMapper.insert(groupUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result updateGroup(UserEntity signedUser, GroupEntity group) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(group.getId());
        if (dbGroup == null || !signedUser.getEmail().equals(dbGroup.getUserEmail())) {
            return CommonResult.FAILURE;
        }
        dbGroup.setName(group.getName());
        dbGroup.setUpdatedAt(LocalDateTime.now());
        return this.groupMapper.update(dbGroup) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result deleteGroup(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(id);
        if (dbGroup == null || !signedUser.getEmail().equals(dbGroup.getUserEmail())) {
            return CommonResult.FAILURE;
        }
        return this.groupMapper.delete(id) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public ResultTuple<GroupUserVo[]> getGrantedUsersByGroupId(int groupId) {
        if (groupId < 0) {
            return ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        GroupUserVo[] dbGrantedUsers = this.groupUserMappingMapper.selectGrantedUsersByGroupId(groupId);
        if (dbGrantedUsers == null) {
            return ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }


        return ResultTuple.<GroupUserVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbGrantedUsers)
                .build();
    }

    public ResultTuple<GroupUserVo[]> getPendingUsersByUserEmail(String userEmail) {
        if (userEmail == null) {
            ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        GroupUserVo[] dbPendingUsers = this.groupUserMappingMapper.selectPendingUsersByUserEmail(userEmail);
        if (dbPendingUsers == null) {
            return ResultTuple.<GroupUserVo[]>builder().result(CommonResult.FAILURE).build();
        }
        return ResultTuple.<GroupUserVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbPendingUsers)
                .build();
    }

    public ResultTuple<GroupUserVo[]> getReceivedByUserEmail(String userEmail) {
        if (userEmail == null) {
            ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        GroupUserVo[] dbReceivedUsers = this.groupUserMappingMapper.selectReceivedByUserEmail(userEmail);
        if (dbReceivedUsers == null) {
            return ResultTuple.<GroupUserVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<GroupUserVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbReceivedUsers)
                .build();
    }

    public Result acceptInvitation(UserEntity signedUser, int groupId) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity dbInvitation = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, signedUser.getEmail());
        if (dbInvitation == null) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(dbInvitation.getGroupId());
        UserEntity requester = this.userMapper.selectByEmail(dbGroup.getUserEmail());
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(requester.getEmail());
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 [%s]그룹 초대를 수락하였습니다.", signedUser.getNickname(), dbGroup.getName()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        dbInvitation.setAccepted(true);
        return this.groupUserMappingMapper.updateByGroupIdAndUserEmail(dbInvitation) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result declineInvitation(UserEntity signedUser, int groupId) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity dbInvitation = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, signedUser.getEmail());
        if (dbInvitation == null) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(dbInvitation.getGroupId());
        UserEntity requester = this.userMapper.selectByEmail(dbGroup.getUserEmail());
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(requester.getEmail());
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 [%s]그룹 초대를 거절하였습니다.",  signedUser.getNickname(), dbGroup.getName()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        return this.groupUserMappingMapper.deleteByGroupIdAndUserEmail(groupId, signedUser.getEmail()) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result deleteSentInvitation(UserEntity signedUser, int groupId, String userEmail) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity dbSentInvitation = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(groupId, userEmail);
        if (dbSentInvitation == null) {
            return CommonResult.FAILURE;
        }
        GroupEntity dbGroup = this.groupMapper.selectById(groupId);
        if (dbGroup == null || !dbGroup.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE;
        }
        return this.groupUserMappingMapper.deleteByGroupIdAndUserEmail(groupId, userEmail) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
