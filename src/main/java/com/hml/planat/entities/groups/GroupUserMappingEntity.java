package com.hml.planat.entities.groups;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = {"groupId", "userEmail"})
public class GroupUserMappingEntity {
    private int groupId;
    private String userEmail;
    private boolean isAccepted;
    private LocalDateTime createdAt;
}
