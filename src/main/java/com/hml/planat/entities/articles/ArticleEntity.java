package com.hml.planat.entities.articles;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class ArticleEntity {
    private int id;
    private int scheduleId;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
