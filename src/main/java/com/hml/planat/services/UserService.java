package com.hml.planat.services;

import com.hml.planat.entities.users.ContactTokenEntity;
import com.hml.planat.entities.users.EmailTokenEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.ContactTokenMapper;
import com.hml.planat.mappers.EmailTokenMapper;
import com.hml.planat.mappers.UserMapper;
import com.hml.planat.regexes.ContactTokenRegex;
import com.hml.planat.regexes.EmailTokenRegex;
import com.hml.planat.regexes.UserRegex;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.results.user.LoginResult;
import com.hml.planat.results.user.RegisterResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserMapper userMapper;
    private final EmailTokenMapper emailTokenMapper;
    private final ContactTokenMapper contactTokenMapper;

    @Autowired
    public UserService(UserMapper userMapper, EmailTokenMapper emailTokenMapper, ContactTokenMapper contactTokenMapper) {
        this.userMapper = userMapper;
        this.emailTokenMapper = emailTokenMapper;
        this.contactTokenMapper = contactTokenMapper;
    }

    // 회원정보 수정
    public Result updateData(UserEntity signedUser, UserEntity newData, ContactTokenEntity contactToken) {
        // 셀렉뜨 바이 이메일
        UserEntity dbUser = userMapper.selectByEmail(signedUser.getEmail());
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        // password 가 signedUser.getPassword 와 같으면 password 변경 X
        if (newData.getPassword() != null) {
            if (UserRegex.password.matches(newData.getPassword())) {
                dbUser.setPassword(BCrypt.hashpw(newData.getPassword(), BCrypt.gensalt()));
            }
        }
        // nickname 이 signedUSer.getNickname 과 같으면 nickname 변경 X
        // nickname 변경 시 중복체크
        if (!dbUser.getNickname().equals(newData.getNickname())) {
            if (UserRegex.nickname.matches(newData.getNickname())) {
                UserEntity dbUserNickname = this.userMapper.selectByNickname(dbUser.getNickname());
                if (dbUserNickname == null) {
                    dbUser.setNickname(newData.getNickname());
                }
            }
        }
        if (!UserRegex.contactFirst.matches(dbUser.getContactFirst()) || !UserRegex.contactSecond.matches(dbUser.getContactSecond()) || !UserRegex.contactThird.matches(dbUser.getContactThird())) {
            if (UserRegex.contactFirst.matches(dbUser.getContactFirst()) && UserRegex.contactSecond.matches(dbUser.getContactSecond()) && UserRegex.contactThird.matches(dbUser.getContactThird())) {
                ContactTokenEntity dbContactToken = this.contactTokenMapper.selectContactAndCodeSalt(contactToken.getContactFirst(), contactToken.getContactSecond(), contactToken.getContactThird(), contactToken.getCode(), contactToken.getSalt());
                if (dbContactToken == null || dbContactToken.isUsed()) {
                    return CommonResult.FAILURE;
                }
                dbUser.setContactFirst(dbContactToken.getContactFirst());
                dbUser.setContactSecond(dbContactToken.getContactSecond());
                dbUser.setContactThird(dbContactToken.getContactThird());
            }
        }
        dbUser.setImageData(newData.getImageData());
        dbUser.setImageType(newData.getImageType());
        dbUser.setName(newData.getName());
        dbUser.setBirth(newData.getBirth());
        dbUser.setGender(newData.getGender());
        dbUser.setContactMvnoCode(newData.getContactMvnoCode());
        dbUser.setAddressPostal(newData.getAddressPostal());
        dbUser.setAddressPrimary(newData.getAddressPrimary());
        dbUser.setAddressSecondary(newData.getAddressSecondary());
        dbUser.setUpdatedAt(LocalDateTime.now());
        return this.userMapper.update(newData) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result checkEmail(String email) {
        if (email == null || !UserRegex.email.matches(email)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByEmail(email) > 0
                ? CommonResult.FAILURE_DUPLICATE
                : CommonResult.SUCCESS;
    }

    public Result checkNickname(String nickname) {
        if (nickname == null || !UserRegex.nickname.matches(nickname)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByNickname(nickname) > 0
                ? CommonResult.FAILURE_DUPLICATE
                : CommonResult.SUCCESS;
    }

    public ResultTuple<UserEntity> login(String email, String password) {
        if (!UserRegex.email.matches(email) || !UserRegex.password.matches(password)) {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE)
                    .build();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDeleted()) {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE)
                    .build();
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (dbUser.isSuspended()) {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_SUSPENDED)
                    .build();
        }
        return ResultTuple.<UserEntity>builder()
                .payload(dbUser)
                .result(CommonResult.SUCCESS)
                .build();
    }

    public UserEntity getUserByEmail(String email) {
        return this.userMapper.selectByEmail(email);
    }

    public UserEntity getUserImageByEmail(String email) {
        return this.userMapper.selectByEmailWithImage(email);
    }

    public ResultTuple<UserEntity[]> getUsersByContact(String contactFirst, String contactSecond, String contactThird) {
        if (!UserRegex.contactFirst.matches(contactFirst) || !UserRegex.contactSecond.matches(contactSecond) || !UserRegex.contactThird.matches(contactThird)) {
            return ResultTuple.<UserEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<UserEntity[]>builder()
                .payload(this.userMapper.selectAllByContact(contactFirst, contactSecond, contactThird))
                .result(CommonResult.SUCCESS)
                .build();
    }

    public Result recoverPassword(String email, String password, ContactTokenEntity contactToken) {
        if (contactToken == null ||
                !UserRegex.email.matches(email) ||
                !UserRegex.password.matches(password) ||
                !UserRegex.contactFirst.matches(contactToken.getContactFirst()) ||
                !UserRegex.contactSecond.matches(contactToken.getContactSecond()) ||
                !UserRegex.contactThird.matches(contactToken.getContactThird())) {
            return CommonResult.FAILURE;
        }
        ContactTokenEntity dbContactToken = this.contactTokenMapper.selectContactAndCodeSalt(contactToken.getContactFirst(), contactToken.getContactSecond(), contactToken.getContactThird(), contactToken.getCode(), contactToken.getSalt());
        if (dbContactToken == null || !dbContactToken.isUsed()) {
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null ||
                dbUser.isDeleted() ||
                dbUser.isSuspended() ||
                !dbUser.getContactFirst().equals(contactToken.getContactFirst()) ||
                !dbContactToken.getContactSecond().equals(contactToken.getContactSecond()) ||
                !dbContactToken.getContactThird().equals(contactToken.getContactThird())) {
            return CommonResult.FAILURE;
        }
        String encryptedPassword = BCrypt.hashpw(dbUser.getPassword(), BCrypt.gensalt());
        dbUser.setPassword(encryptedPassword);
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result register(EmailTokenEntity emailToken, ContactTokenEntity contactToken, UserEntity user) {
        if (emailToken == null ||
                contactToken == null ||
                user == null ||
                user.getGender() == null ||
                user.getContactMvnoCode() == null ||
                user.getAddressPostal() == null ||
                user.getAddressPrimary() == null ||
                user.getAddressSecondary() == null ||
                (!user.getGender().equals("M") && !user.getGender().equals("F")) ||
                !EmailTokenRegex.code.matches(emailToken.getCode()) ||
                !EmailTokenRegex.salt.matches(emailToken.getSalt()) ||
                !ContactTokenRegex.code.matches(contactToken.getCode()) ||
                !ContactTokenRegex.salt.matches(contactToken.getSalt()) ||
                !UserRegex.email.matches(user.getEmail()) ||
                !UserRegex.password.matches(user.getPassword()) ||
                !UserRegex.nickname.matches(user.getNickname()) ||
                !UserRegex.name.matches(user.getName()) ||
                !UserRegex.contactFirst.matches(contactToken.getContactFirst()) ||
                !UserRegex.contactSecond.matches(user.getContactSecond()) ||
                !UserRegex.contactThird.matches(user.getContactThird())) {
            return CommonResult.FAILURE;
        }
        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectEmailAndCodeSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());
        if (dbEmailToken == null || !dbEmailToken.isUsed() || !dbEmailToken.getEmail().equals(emailToken.getEmail())) {
            return CommonResult.FAILURE;
        }
        ContactTokenEntity dbContactToken = this.contactTokenMapper.selectContactAndCodeSalt(contactToken.getContactFirst(), contactToken.getContactSecond(), contactToken.getContactThird(), contactToken.getCode(), contactToken.getSalt());
        if (dbContactToken == null || !dbContactToken.isUsed() || (!dbContactToken.getContactSecond().equals(contactToken.getContactSecond())) && !dbContactToken.getContactThird().equals(contactToken.getContactThird())) {
            return CommonResult.FAILURE;
        }
        if (this.userMapper.selectCountByEmail(user.getEmail()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if (this.userMapper.selectCountByNickname(user.getNickname()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        String encryptedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(encryptedPassword);
        user.setAdmin(false);
        user.setDeleted(false);
        user.setSuspended(false);
        user.setTermServiceAt(LocalDate.now());
        user.setTermPrivacyAt(LocalDate.now());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return this.userMapper.insert(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
























