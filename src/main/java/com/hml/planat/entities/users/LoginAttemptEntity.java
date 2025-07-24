package com.hml.planat.entities.users;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class LoginAttemptEntity {
    private int index;
    private String email;
    private String ip;
    private String ua;
    private String result;
    private LocalDateTime createdAt;
}
