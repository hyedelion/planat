package com.hml.planat.mappers;

import com.hml.planat.entities.users.ContactTokenEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ContactTokenMapper {
    int insert(@Param(value = "contactToken") ContactTokenEntity contactToken);

    ContactTokenEntity selectContactAndCodeSalt(@Param(value = "contactFirst") String contactFirst,
                                                @Param(value = "contactSecond") String contactSecond,
                                                @Param(value = "contactThird") String contactThird,
                                                @Param(value = "code") String code,
                                                @Param(value = "salt") String salt);

    int update(@Param(value = "contactToken") ContactTokenEntity contactToken);
}
