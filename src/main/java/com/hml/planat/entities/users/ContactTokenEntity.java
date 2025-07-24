package com.hml.planat.entities.users;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = {"contactFirst", "contactSecond", "contactThird", "code", "salt"})
public class ContactTokenEntity {
    private String contactFirst;
    private String contactSecond;
    private String contactThird;
    private String code;
    private String salt;
    private String userAgent;
    private boolean isUsed;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
