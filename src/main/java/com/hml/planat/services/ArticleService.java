package com.hml.planat.services;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.ArticleMapper;
import com.hml.planat.mappers.AttachmentMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.vos.ArticleVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;
    private final AttachmentMapper attachmentMapper;

    @Autowired
    public ArticleService(ArticleMapper articleMapper, AttachmentMapper attachmentMapper) {
        this.articleMapper = articleMapper;
        this.attachmentMapper = attachmentMapper;
    }
    // 게시물 불러오기
    public ResultTuple<ArticleVo[]> getAllArticles(UserEntity signedUser, int scheduleId) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<ArticleVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (scheduleId <= 0) {
            return ResultTuple.<ArticleVo[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        ArticleEntity[] dbArticles = this.articleMapper.selectAll(scheduleId); // [ArticleEntity, ArticleEntity, ArticleEntity]
                                                                               // [ArticleVo    , ArticleVo    , ArticleVo]
        ArticleVo[] articles = new ArticleVo[dbArticles.length]; // [ null, null, null ] > [ArticleVo    , ArticleVo    , ArticleVo]
        for (int i = 0; i < dbArticles.length; i++) {
            articles[i] = new ArticleVo();
            articles[i].setId(dbArticles[i].getId());
            articles[i].setScheduleId(dbArticles[i].getScheduleId());
            articles[i].setUserEmail(dbArticles[i].getUserEmail());
            articles[i].setContent(dbArticles[i].getContent());
            articles[i].setCreatedAt(dbArticles[i].getCreatedAt());
            articles[i].setModifiedAt(dbArticles[i].getModifiedAt());
            articles[i].setAttachments(this.attachmentMapper.selectAllByArticleId(articles[i].getId()));
            articles[i].setMine(dbArticles[i].getUserEmail().equals(signedUser.getEmail()));
        }

        return ResultTuple.<ArticleVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(articles)
                .build();
    }

    // 게시물 작성하기
    public Result writeArticle(UserEntity signedUser, ArticleEntity articleEntity) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        if (articleEntity == null) {
            return CommonResult.FAILURE;
        }
        return this.articleMapper.insertArticle(articleEntity) >= 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 게시물 수정하기
    public Result updateArticle(UserEntity signedUser, ArticleEntity articleEntity) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        ArticleEntity dbArticle = this.articleMapper.selectArticleById(articleEntity.getId());
        if (dbArticle == null) {
            return CommonResult.FAILURE;
        }
        dbArticle.setContent(articleEntity.getContent());
        dbArticle.setModifiedAt(LocalDateTime.now());
        return this.articleMapper.updateArticle(dbArticle) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    // 게시물 삭제하기
    public Result deleteArticle(UserEntity signedUser, int id) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE;
        }
        ArticleEntity dbArticle = this.articleMapper.selectArticleById(id);
        if (dbArticle == null) {
            return CommonResult.FAILURE;
        }
        return this.articleMapper.deleteArticleById(id) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
