package com.hml.planat.mappers;

import com.hml.planat.entities.comments.CommentEntity;
import com.hml.planat.vos.CommentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    CommentVo[] selectAll(@Param(value = "articleId") int articleId);

    int insertComment(CommentEntity comment);

    int updateComment(CommentEntity comment);

    int deleteCommentById(CommentEntity comment);

    CommentEntity selectCommentById(int id);
}
