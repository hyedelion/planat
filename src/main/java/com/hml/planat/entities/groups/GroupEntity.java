package com.hml.planat.entities.groups;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "userEmail")
public class GroupEntity {
    private int id;
    private String userEmail;
    private String name;
    private String backgroundColor;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
