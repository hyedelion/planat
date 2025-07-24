package com.hml.planat.services;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.comments.CommentEntity;
import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.schedules.ScheduleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.ArticleMapper;
import com.hml.planat.mappers.CommentMapper;
import com.hml.planat.mappers.GroupUserMappingMapper;
import com.hml.planat.mappers.ScheduleMapper;
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
    private final ScheduleMapper scheduleMapper;

    @Autowired
    public CommentService(ArticleMapper articleMapper, CommentMapper commentMapper, GroupUserMappingMapper groupUserMappingMapper, ScheduleMapper scheduleMapper) {
        this.articleMapper = articleMapper;
        this.commentMapper = commentMapper;
        this.groupUserMappingMapper = groupUserMappingMapper;
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

        return ResultTuple.<CommentVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.commentMapper.selectAll(articleId))
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
        comment.setUpdateAt(null);

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
        ArticleEntity article = this.articleMapper.selectArticleById(comment.getArticleId());
        ScheduleEntity schedule = this.scheduleMapper.selectById(article.getScheduleId());
        GroupUserMappingEntity groupUSerMapping = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(schedule.getGroupId(), signedUser.getEmail());
        if (groupUSerMapping == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        comment.setContent(comment.getContent());
        comment.setUpdateAt(LocalDateTime.now());

        return this.commentMapper.updateComment(comment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 댓글 삭제
    public Result deleteComment(UserEntity signedUser, CommentEntity comment) {
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
        CommentEntity dbComment = this.commentMapper.selectCommentById(comment.getId());
        if (dbComment == null) {
            return CommonResult.FAILURE;
        }
        return this.commentMapper.deleteCommentById(dbComment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
