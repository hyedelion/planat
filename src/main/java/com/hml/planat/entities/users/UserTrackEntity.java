package com.hml.planat.entities.users;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "userEmail")
public class UserTrackEntity {
    private String userEmail;
    private String requestUri;
    private String requestParam;
    private String clientIp;
    private String clientUa;
    private LocalDateTime updatedAt;
}