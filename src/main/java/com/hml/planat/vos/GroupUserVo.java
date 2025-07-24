package com.hml.planat.vos;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class GroupUserVo {
    private int groupId;
    private String groupName;
    private String backgroundColor;
    private String color;
    private String userEmail;
    private String userNickname;
    private Boolean isMine;
    private Integer userCount;
}