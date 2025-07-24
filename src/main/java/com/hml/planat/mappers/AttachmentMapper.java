package com.hml.planat.mappers;

import com.hml.planat.entities.attachments.AttachmentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AttachmentMapper {
    int insert(@Param(value = "attachment") AttachmentEntity attachment);

    AttachmentEntity selectById(@Param(value = "id") int id);

    AttachmentEntity[] selectAllByScheduleId(@Param(value = "scheduleId") int scheduleId);

    AttachmentEntity[] selectAllByArticleId(@Param(value = "articleId") int articleId);

    int deleteById(@Param(value = "id") int id);
}
