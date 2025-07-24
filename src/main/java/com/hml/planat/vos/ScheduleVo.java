package com.hml.planat.vos;

import com.hml.planat.entities.attachments.AttachmentEntity;
import com.hml.planat.entities.schedules.ScheduleEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleVo extends ScheduleEntity {
    private AttachmentEntity[] attachments;
    private ArticleVo[] articles;
    private boolean isMine;
}
