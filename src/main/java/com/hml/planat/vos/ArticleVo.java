package com.hml.planat.vos;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.attachments.AttachmentEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ArticleVo extends ArticleEntity {
    private String userNickname;
    private AttachmentEntity[] attachments;
    private CommentVo[] comments;
    private boolean isMine;
}
