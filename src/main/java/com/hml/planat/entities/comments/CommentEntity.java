package com.hml.planat.entities.comments;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class CommentEntity {
    private int id;
    private int articleId;
    private Integer commentId;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
}
