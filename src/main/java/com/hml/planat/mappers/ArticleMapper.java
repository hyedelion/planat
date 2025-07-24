package com.hml.planat.mappers;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.vos.ArticleVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleMapper {
    ArticleVo[] selectAll(@Param(value = "scheduleId") int scheduleId);

    int insertArticle(ArticleEntity articleEntity);

    ArticleEntity selectArticleById(@Param(value = "id") int id);

    ArticleEntity selectArticleByIdAndUserEmail(@Param(value = "id") int id,
                                                @Param(value = "userEmail") String userEmail);

    int updateArticle(ArticleEntity articleEntity);

    int deleteArticleById(@Param(value = "id") int id);
}
