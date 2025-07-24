package com.hml.planat.services;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.schedules.ScheduleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.*;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.vos.ArticleVo;
import com.hml.planat.vos.GroupUserVo;
import com.hml.planat.vos.ScheduleVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ScheduleService {
    private final ArticleMapper articleMapper;
    private final AttachmentMapper attachmentMapper;
    private final CommentMapper commentMapper;
    private final ScheduleMapper scheduleMapper;
    private final NotificationMapper notificationMapper;
    private final GroupMapper groupMapper;
    private final GroupUserMappingMapper groupUserMappingMapper;

    @Autowired
    public ScheduleService(ArticleMapper articleMapper, AttachmentMapper attachmentMapper, CommentMapper commentMapper, ScheduleMapper scheduleMapper, NotificationMapper notificationMapper, GroupMapper groupMapper, GroupUserMappingMapper groupUserMappingMapper) {
        this.articleMapper = articleMapper;
        this.attachmentMapper = attachmentMapper;
        this.commentMapper = commentMapper;
        this.scheduleMapper = scheduleMapper;
        this.notificationMapper = notificationMapper;
        this.groupMapper = groupMapper;
        this.groupUserMappingMapper = groupUserMappingMapper;
    }

    // 일정 추가
    public Result addIndex(UserEntity signedUser, ScheduleEntity schedule) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        if (schedule == null) {
            return CommonResult.FAILURE;
        }

        GroupUserMappingEntity[] groupUserMappings = this.groupUserMappingMapper.selectByGroupId(schedule.getGroupId());
        GroupEntity group = this.groupMapper.selectById(schedule.getGroupId());
        for (GroupUserMappingEntity groupUserMapping : groupUserMappings) {
            if (groupUserMapping.getUserEmail().equals(signedUser.getEmail())) {
                continue;
            }
            NotificationEntity notification = new NotificationEntity();
            notification.setReferrerUserEmail(signedUser.getEmail());
            notification.setTargetUserEmail(groupUserMapping.getUserEmail());
            notification.setMessage(String.format("[%s]그룹의 [%s]일정이 등록되었습니다.", group.getName(), schedule.getTitle()));
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            this.notificationMapper.insert(notification);
        }

        schedule.setUserEmail(signedUser.getEmail());
        return this.scheduleMapper.insert(schedule) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 전체 일정 불러오기
    public ResultTuple<ScheduleEntity[]> getAllQuery(UserEntity signedUser, LocalDateTime from, LocalDateTime to) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<ScheduleEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        ScheduleEntity[] dbSchedule = this.scheduleMapper.selectAll(signedUser.getEmail(), from, to);
        return ResultTuple.<ScheduleEntity[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbSchedule)
                .build();
    }

    // 일정 하나만 불러오기
    public ResultTuple<ScheduleVo> getIndex(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<ScheduleVo>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        ScheduleEntity dbSchedule = this.scheduleMapper.selectById(id);
        if (dbSchedule == null) {
            return ResultTuple.<ScheduleVo>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        ScheduleVo schedule = new ScheduleVo();
        schedule.setId(dbSchedule.getId());
        schedule.setUserEmail(dbSchedule.getUserEmail());
        schedule.setGroupId(dbSchedule.getGroupId());
        schedule.setTitle(dbSchedule.getTitle());
        schedule.setStartAt(dbSchedule.getStartAt());
        schedule.setEndAt(dbSchedule.getEndAt());
        schedule.setAddressPrimary(dbSchedule.getAddressPrimary());
        schedule.setAddressSecondary(dbSchedule.getAddressSecondary());
        schedule.setLatitude(dbSchedule.getLatitude());
        schedule.setLongitude(dbSchedule.getLongitude());
        schedule.setAttachments(this.attachmentMapper.selectAllByScheduleId(dbSchedule.getId()));
        schedule.setMine( schedule.getUserEmail().equals(signedUser.getEmail()) );

        ArticleVo[] articleVos = this.articleMapper.selectAll(schedule.getId());
        for (int i = 0; i < articleVos.length; i++) {
            ArticleVo articleVo = articleVos[i];
            articleVo.setMine(articleVo.getUserEmail().equals(signedUser.getEmail()));
            articleVo.setAttachments(this.attachmentMapper.selectAllByArticleId(articleVo.getId()));
            articleVo.setComments(this.commentMapper.selectAll(articleVo.getId()));
        }
        schedule.setArticles(articleVos);

        return ResultTuple.<ScheduleVo>builder()
                .result(CommonResult.SUCCESS)
                .payload(schedule)
                .build();
    }

    // 일정 삭제
    public Result deleteIndex(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        ScheduleEntity dbSchedule = this.scheduleMapper.selectByIdAndUserEmail(id, signedUser.getEmail());
        if (dbSchedule == null) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity[] groupUserMappings = this.groupUserMappingMapper.selectByGroupId(dbSchedule.getGroupId());
        GroupEntity group = this.groupMapper.selectById(dbSchedule.getGroupId());
        for (GroupUserMappingEntity groupUserMapping : groupUserMappings) {
            if (groupUserMapping.getUserEmail().equals(signedUser.getEmail())) {
                continue;
            }
            NotificationEntity notification = new NotificationEntity();
            notification.setReferrerUserEmail(signedUser.getEmail());
            notification.setTargetUserEmail(groupUserMapping.getUserEmail());
            notification.setMessage(String.format("[%s]그룹의 [%s]일정이 삭제되었습니다.", group.getName(), dbSchedule.getTitle()));
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            this.notificationMapper.insert(notification);
        }
        return this.scheduleMapper.delete(dbSchedule) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 일정 수정
    public Result patchIndex(UserEntity signedUser, ScheduleEntity schedule) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        ScheduleEntity dbSchedule = this.scheduleMapper.selectByIdAndUserEmail(schedule.getId(), signedUser.getEmail());
        if (dbSchedule == null) {
            return CommonResult.FAILURE;
        }
        GroupUserMappingEntity[] groupUserMappings = this.groupUserMappingMapper.selectByGroupId(dbSchedule.getId());
        GroupEntity group = this.groupMapper.selectById(dbSchedule.getGroupId());
        for (GroupUserMappingEntity groupUserMapping : groupUserMappings) {
            if (groupUserMapping.getUserEmail().equals(signedUser.getEmail())) {
                continue;
            }
            NotificationEntity notification = new NotificationEntity();
            notification.setReferrerUserEmail(signedUser.getEmail());
            notification.setTargetUserEmail(groupUserMapping.getUserEmail());
            notification.setMessage(String.format("[%s]그룹의 [%s]일정이 수정되었습니다.", group.getName(), schedule.getTitle()));
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            this.notificationMapper.insert(notification);
        }
        return this.scheduleMapper.update(schedule) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
