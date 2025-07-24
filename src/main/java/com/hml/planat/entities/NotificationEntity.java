package com.hml.planat.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class NotificationEntity {
    private String id;
    private String targetUserEmail;
    private String referrerUserEmail;
    private String message;
    private LocalDateTime createdAt;
    private boolean isRead;
}
