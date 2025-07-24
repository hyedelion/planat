package com.hml.planat.entities.schedules;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class ScheduleEntity {
    private int id;
    private String userEmail;
    private Integer groupId;
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String addressPrimary;
    private String addressSecondary;
    private Double latitude;
    private Double longitude;
}
