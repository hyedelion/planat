package com.hml.planat.services;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.comments.CommentEntity;
import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.schedules.ScheduleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.*;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.vos.CommentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CommentService {
    private final ArticleMapper articleMapper;
    private final CommentMapper commentMapper;
    private final GroupUserMappingMapper groupUserMappingMapper;
    private final NotificationMapper notificationMapper;
    private final ScheduleMapper scheduleMapper;

    @Autowired
    public CommentService(ArticleMapper articleMapper, CommentMapper commentMapper, GroupUserMappingMapper groupUserMappingMapper, NotificationMapper notificationMapper, ScheduleMapper scheduleMapper) {
        this.articleMapper = articleMapper;
        this.commentMapper = commentMapper;
        this.groupUserMappingMapper = groupUserMappingMapper;
        this.notificationMapper = notificationMapper;
        this.scheduleMapper = scheduleMapper;
    }

    //댓글 불러오기
    public ResultTuple<CommentVo[]> getAllComments(UserEntity signedUser, int articleId) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<CommentVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (articleId == 0) {
            return ResultTuple.<CommentVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        // 1. articleId로 ArticleEntity를 SELECT해 온다.
        ArticleEntity article = this.articleMapper.selectArticleById(articleId);

        // 2. 위 <1>이 가지고 있는 scheduleId로 ScheduleEntity를 SELECT해 온다.
        ScheduleEntity schedule = this.scheduleMapper.selectById(article.getScheduleId());

        // 2. 위 <2>가 가지고 있는 groupId와 signedUser가 가지고 있는 email로 GroupUserMappingEntity를 SELECT해 온다.
        GroupUserMappingEntity groupUserMapping = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(schedule.getGroupId(), signedUser.getEmail());

        // 3. 위 <3>이 null이면 현재 로그인한 사용자는 해당 게시글 및 이의 댓글에 접근할 권한이 없는 것 임으로 FAILURE_SESSION_EXPIRED를 반환.
        if (groupUserMapping == null) {
            return ResultTuple.<CommentVo[]>builder()
                    .result(CommonResult.FAILURE_SESSION_EXPIRED)
                    .build();
        }

        CommentVo[] comments = this.commentMapper.selectAll(articleId);
        for (CommentVo comment : comments) {
            if (comment.getUserEmail().equals(signedUser.getEmail())) {
                comment.setMine(true);
            }
        }
        return ResultTuple.<CommentVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(comments)
                .build();
    }

    // 댓글 쓰기
    public Result writeComment(UserEntity signedUser, CommentEntity comment) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        if (comment == null) {
            return CommonResult.FAILURE;
        }
        ArticleEntity article = this.articleMapper.selectArticleById(comment.getArticleId());
        ScheduleEntity schedule = this.scheduleMapper.selectById(article.getScheduleId());
        GroupUserMappingEntity groupUserMapping = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(schedule.getGroupId(), signedUser.getEmail());
        if (groupUserMapping == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        comment.setUserEmail(signedUser.getEmail());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(null);

        NotificationEntity notification = new NotificationEntity();
        if (comment.getCommentId() == null) {
            // 게시글 주인에게 알림 보내기
            if (!article.getUserEmail().equals(signedUser.getEmail())) {
                notification.setTargetUserEmail(article.getUserEmail());
                notification.setReferrerUserEmail(signedUser.getEmail());
                notification.setMessage(String.format("[%s] 게시글에 [%s] 님이 댓글을 등록하였습니다.", schedule.getTitle(), signedUser.getNickname()));
                notification.setCreatedAt(LocalDateTime.now());
                notification.setRead(false);
                this.notificationMapper.insert(notification);
            }
        } else {
            CommentEntity dbComment = this.commentMapper.selectCommentById(comment.getCommentId());
            if (!dbComment.getUserEmail().equals(signedUser.getEmail())) {
                notification.setTargetUserEmail(dbComment.getUserEmail());
                notification.setReferrerUserEmail(signedUser.getEmail());
                notification.setMessage(String.format("[%s] 게시글에 [%s] 님이 답글을 등록하였습니다.", schedule.getTitle(), signedUser.getNickname()));
                notification.setCreatedAt(LocalDateTime.now());
                notification.setRead(false);
                this.notificationMapper.insert(notification);
            }
        }



        return this.commentMapper.insertComment(comment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 댓글 수정
    public Result updateComment(UserEntity signedUser, CommentEntity comment) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        if (comment == null) {
            return CommonResult.FAILURE;
        }
        CommentEntity dbComment = this.commentMapper.selectCommentById(comment.getId());
        if (dbComment == null) {
            return CommonResult.FAILURE;
        }
        if (!dbComment.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        dbComment.setContent(comment.getContent());
        dbComment.setUpdatedAt(LocalDateTime.now());
        return this.commentMapper.updateComment(dbComment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 댓글 삭제
    public Result deleteComment(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        CommentEntity dbComment = this.commentMapper.selectCommentById(id);
        if (dbComment == null) {
            return CommonResult.FAILURE;
        }
        if (!dbComment.getUserEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        return this.commentMapper.deleteCommentById(id) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
