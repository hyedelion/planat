package com.hml.planat.entities.attachments;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class AttachmentEntity {
    private int id;
    private Integer scheduleId;
    private Integer articleId;
    private String userEmail;
    private String name;
    private String contentType;
    private byte[] data;
    private long size;
    private LocalDateTime createdAt;
}
