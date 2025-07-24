package com.hml.planat.entities.users;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = {"requesterUserEmail", "requesteeUserEmail"})
public class FriendEntity {
    private String requesterUserEmail;
    private String requesteeUserEmail;
    private boolean isAccepted;
    private LocalDateTime createdAt;
}
