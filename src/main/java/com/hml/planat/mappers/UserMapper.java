package com.hml.planat.mappers;

import com.hml.planat.entities.users.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insert(@Param(value = "user")UserEntity user);

    int update(@Param(value = "user")UserEntity user);

    UserEntity selectByEmail(@Param(value = "email") String email);

    UserEntity selectByEmailWithImage(@Param(value = "email") String email);

    int selectCountByEmail(@Param(value = "email") String email);

    int selectCountByNickname(@Param(value = "nickname") String nickname);

    int selectCountByContact(@Param(value = "contactFirst") String contactFirst,
                             @Param(value = "contactSecond") String contactSecond,
                             @Param(value = "contactThird") String contactThird
                             );

    UserEntity[] selectAllByContact(@Param(value = "contactFirst") String contactFirst,
                               @Param(value = "contactSecond") String contactSecond,
                               @Param(value = "contactThird") String contactThird);

    UserEntity selectByNickname(@Param(value = "nickname") String nickname);
}
