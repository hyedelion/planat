package com.hml.planat.services;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.users.FriendEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.FriendMapper;
import com.hml.planat.mappers.NotificationMapper;
import com.hml.planat.mappers.UserMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.vos.FriendVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FriendService {
    private final FriendMapper friendMapper;
    private final UserMapper userMapper;
    private final NotificationMapper notificationMapper;

    @Autowired
    public FriendService(FriendMapper friendMapper, UserMapper userMapper, NotificationMapper notificationMapper) {
        this.friendMapper = friendMapper;
        this.userMapper = userMapper;
        this.notificationMapper = notificationMapper;
    }

    public ResultTuple<FriendVo[]> getAllFriends(UserEntity signedUser) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<FriendVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<FriendVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.friendMapper.selectAllFriendsByUserEmail(signedUser.getEmail()))
                .build();
    }

    public Result deleteRelationship(UserEntity signedUser, String friendEmail) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        FriendVo dbFriend = this.friendMapper.selectByFriendEmail(friendEmail);
        if (dbFriend == null) {
            return CommonResult.FAILURE;
        }
        return this.friendMapper.deleteRelationshipByFriendEmail(friendEmail) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result addRequest(UserEntity signedUser, String email, String nickname) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        UserEntity user;
        if (email == null) {
            user = this.userMapper.selectByNickname(nickname);
        } else {
            user = this.userMapper.selectByEmail(email);
        }
        if (user == null) {
            return CommonResult.FAILURE_NOT_FOUND;
        }
        if (user.equals(signedUser)) {
            return CommonResult.FAILURE_SELF;
        }
        FriendEntity dbFriend = this.friendMapper.selectByRequesterAndUserEmail(signedUser.getEmail(), user.getEmail());
        if (dbFriend != null) {
            return CommonResult.FAILURE_DUPLICATE;
        }
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(user.getEmail());
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 친구요청을 보냈습니다.", signedUser.getNickname()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        FriendEntity friend = new FriendEntity();
        friend.setRequesterUserEmail(signedUser.getEmail());
        friend.setRequesteeUserEmail(user.getEmail());
        friend.setAccepted(false);
        friend.setCreatedAt(LocalDateTime.now());

        return this.friendMapper.insert(friend) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public ResultTuple<FriendVo[]> getSent(String RequesterUserEmail) {
        if (RequesterUserEmail == null) {
            ResultTuple.<FriendVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        return ResultTuple.<FriendVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.friendMapper.selectFriendRequestByRequesterEmail(RequesterUserEmail))
                .build();
    }

    public ResultTuple<FriendVo[]> getReceived(String RequesteeUserEmail) {
        if (RequesteeUserEmail == null) {
            ResultTuple.<FriendVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<FriendVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.friendMapper.selectFriendRequestByRequesteeEmail(RequesteeUserEmail))
                .build();
    }

    public Result acceptRequest(UserEntity signedUser, String requesterUserEmail) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        FriendEntity dbFriend = this.friendMapper.selectByRequesterAndUserEmail(requesterUserEmail, signedUser.getEmail());
        if (dbFriend == null) {
            return CommonResult.FAILURE;
        }
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(requesterUserEmail);
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 친구요청을 수락하였습니다.", signedUser.getNickname()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        dbFriend.setAccepted(true);
        return this.friendMapper.update(dbFriend) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result declineRequest(UserEntity signedUser, String requesterUserEmail) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        FriendEntity dbFriend = this.friendMapper.selectByRequesterAndUserEmail(requesterUserEmail, signedUser.getEmail());
        if (dbFriend == null) {
            return CommonResult.FAILURE;
        }
        NotificationEntity notification = new NotificationEntity();
        notification.setTargetUserEmail(requesterUserEmail);
        notification.setReferrerUserEmail(signedUser.getEmail());
        notification.setMessage(String.format("[%s]님이 친구요청을 거절하였습니다.", signedUser.getNickname()));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        this.notificationMapper.insert(notification);

        return this.friendMapper.delete(dbFriend.getRequesterUserEmail(), dbFriend.getRequesteeUserEmail()) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result cancelRequest(UserEntity signedUser, String requesteeUserEmail) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        FriendEntity dbFriend = this.friendMapper.selectByRequesterAndUserEmail(signedUser.getEmail(), requesteeUserEmail);
        if (dbFriend == null) {
            return CommonResult.FAILURE;
        }
        return this.friendMapper.delete(signedUser.getEmail(), dbFriend.getRequesteeUserEmail()) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}












