package com.hml.planat.services;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.attachments.AttachmentEntity;
import com.hml.planat.entities.groups.GroupUserMappingEntity;
import com.hml.planat.entities.schedules.ScheduleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.ArticleMapper;
import com.hml.planat.mappers.AttachmentMapper;
import com.hml.planat.mappers.GroupUserMappingMapper;
import com.hml.planat.mappers.ScheduleMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AttachmentService {
    private final ArticleMapper articleMapper;
    private final AttachmentMapper attachmentMapper;
    private final GroupUserMappingMapper groupUserMappingMapper;
    private final ScheduleMapper scheduleMapper;

    @Autowired
    public AttachmentService(ArticleMapper articleMapper, AttachmentMapper attachmentMapper, GroupUserMappingMapper groupUserMappingMapper, ScheduleMapper scheduleMapper) {
        this.articleMapper = articleMapper;
        this.attachmentMapper = attachmentMapper;
        this.groupUserMappingMapper = groupUserMappingMapper;
        this.scheduleMapper = scheduleMapper;
    }

    // 첨부파일 모두 불러오기
    public ResultTuple<AttachmentEntity[]> getAll(UserEntity signedUSer, Integer scheduleId, Integer articleId) {
        if (signedUSer == null || signedUSer.isDeleted() || signedUSer.isSuspended()) {
            return ResultTuple.<AttachmentEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (scheduleId != null) {
            AttachmentEntity[] dbAttachment = attachmentMapper.selectAllByScheduleId(scheduleId);
            return ResultTuple.<AttachmentEntity[]>builder()
                    .result(CommonResult.SUCCESS)
                    .payload(dbAttachment)
                    .build();
        }
        if (articleId != null) {
            AttachmentEntity[] dbAttachment = attachmentMapper.selectAllByArticleId(articleId);
            return ResultTuple.<AttachmentEntity[]>builder()
                    .result(CommonResult.SUCCESS)
                    .payload(dbAttachment)
                    .build();
        }
        return ResultTuple.<AttachmentEntity[]>builder()
                .result(CommonResult.FAILURE)
                .build();
    }

    public ResultTuple<Integer> upload(UserEntity signedUser, AttachmentEntity attachment) {
        // 정규화 하시고
        if (attachment.getScheduleId() != null) {
            // 해당 스케줄에 해당 유저가 업로드할 권한이 있는지 확인하시고
            ScheduleEntity schedule = this.scheduleMapper.selectByIdAndUserEmail(attachment.getScheduleId(), signedUser.getEmail());
            if (schedule == null) {
                // 전달받은 scheduleId로 조회한 ScheduleEntity가 없음
                return ResultTuple.<Integer>builder()
                        .result(CommonResult.FAILURE)
                        .build();
            }
            GroupUserMappingEntity groupUserMapping = this.groupUserMappingMapper.selectByGroupIdAndUserEmail(
                    schedule.getGroupId(),
                    signedUser.getEmail());
            if (groupUserMapping == null) {
                // 조회한 ScheduleEntity와 UserEntity를 조합하여 GroupUserMappingEntity를 SELECT한 결과가 없음.
                // = 해당 사용자는 해당 스케줄이 접근할 권한이 없음. (그룹 소속 아님)
                return ResultTuple.<Integer>builder()
                        .result(CommonResult.FAILURE_SESSION_EXPIRED)
                        .build();
            }
        } else if (attachment.getArticleId() != null) {
            // 해당 게시글이 해당 유저의 소유가 맞는지 확인
            ArticleEntity article = this.articleMapper.selectArticleByIdAndUserEmail(attachment.getArticleId(), signedUser.getEmail());
            System.out.println(article);
            if (article == null) {
                // 전달받은 articleId로 ArticleEntity를 조회했더니 그런거 없음
                return ResultTuple.<Integer>builder()
                        .result(CommonResult.FAILURE)
                        .build();
            }
            if (!article.getUserEmail().equals(signedUser.getEmail())) {
                // 있긴한데 작성자가 로그인한 사람이 아님
                return ResultTuple.<Integer>builder()
                        .result(CommonResult.FAILURE_SESSION_EXPIRED)
                        .build();
            }
        } else {
            // scheduleId, articleId 둘다 안 줬다는 의미 임으로 FAILURE
            // 둘다 안줬으니까 볼거 없고
            return ResultTuple.<Integer>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        attachment.setUserEmail(signedUser.getEmail());
        attachment.setCreatedAt(LocalDateTime.now());
        return this.attachmentMapper.insert(attachment) > 0
                ? ResultTuple.<Integer>builder()
                .payload(attachment.getId())
                .result(CommonResult.SUCCESS)
                .build()
                : ResultTuple.<Integer>builder().result(CommonResult.FAILURE).build();
    }

    // 첨부파일 삭제
    public Result deleteAttachment(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        AttachmentEntity dbAttachment = this.attachmentMapper.selectById(id);
        if (dbAttachment == null) {
            return CommonResult.FAILURE;
        }
        if (dbAttachment.getScheduleId() != null) {
            ScheduleEntity dbSchedule = this.scheduleMapper.selectByIdAndUserEmail(dbAttachment.getScheduleId(), signedUser.getEmail());
            if (dbSchedule == null || !dbSchedule.getUserEmail().equals(signedUser.getEmail())) {
                return CommonResult.FAILURE_SESSION_EXPIRED;
            }
        } else if (dbAttachment.getArticleId() != null) {
            ArticleEntity dbArticle = this.articleMapper.selectArticleByIdAndUserEmail(dbAttachment.getArticleId(), signedUser.getEmail());
            if (dbArticle == null || !dbArticle.getUserEmail().equals(signedUser.getEmail())) {
                return CommonResult.FAILURE_SESSION_EXPIRED;
            }
        }
        return this.attachmentMapper.deleteById(id) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
