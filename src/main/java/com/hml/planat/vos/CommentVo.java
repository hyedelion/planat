package com.hml.planat.vos;

import com.hml.planat.entities.comments.CommentEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentVo extends CommentEntity {
    private String userNickname;
    private boolean isMine;
}
