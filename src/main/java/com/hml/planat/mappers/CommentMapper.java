package com.hml.planat.mappers;

import com.hml.planat.entities.comments.CommentEntity;
import com.hml.planat.vos.CommentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    CommentVo[] selectAll(@Param(value = "articleId") int articleId);

    int insertComment(@Param(value = "comment") CommentEntity comment);

    int updateComment(@Param(value = "comment")CommentEntity comment);

    int deleteCommentById(@Param(value = "id") int id);

    CommentEntity selectCommentById(@Param(value = "id") int id);
}
