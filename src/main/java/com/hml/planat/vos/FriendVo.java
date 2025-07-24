package com.hml.planat.vos;

import com.hml.planat.entities.users.FriendEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FriendVo extends FriendEntity {
    private String requesterUserNickname;
    private String requesteeUserNickname;
    private boolean isOnline;
}
