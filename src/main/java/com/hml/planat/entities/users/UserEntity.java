package com.hml.planat.entities.users;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "email")
public class UserEntity {
    private String email;
    private String password;
    private String nickname;
    private byte[] imageData;
    private String imageType;
    private String imageName;
    private String name;
    private LocalDate birth;
    private String gender;
    private String contactMvnoCode;
    private String contactFirst;
    private String contactSecond;
    private String contactThird;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private LocalDate termServiceAt;
    private LocalDate termPrivacyAt;
    private LocalDate termMarketingAt;
    private boolean isAdmin;
    private boolean isDeleted;
    private boolean isSuspended;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
