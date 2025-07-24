package com.hml.planat.services;

import com.hml.planat.entities.users.ContactTokenEntity;
import com.hml.planat.mappers.ContactTokenMapper;
import com.hml.planat.regexes.ContactTokenRegex;
import com.hml.planat.regexes.UserRegex;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.results.contact_token.VerifyContactTokenResult;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ContactTokenService {
    @SuppressWarnings("deprecation")
    private static ContactTokenEntity generateContactToken(String userAgent, String contactFirst, String contactSecond, String contactThird) {
        String code = RandomStringUtils.randomNumeric(6);
        String salt = RandomStringUtils.randomAlphanumeric(128);
        ContactTokenEntity contactToken = new ContactTokenEntity();
        contactToken.setContactFirst(contactFirst);
        contactToken.setContactSecond(contactSecond);
        contactToken.setContactThird(contactThird);
        contactToken.setCode(code);
        contactToken.setSalt(salt);
        contactToken.setUserAgent(userAgent);
        contactToken.setUsed(false);
        contactToken.setCreatedAt(LocalDateTime.now());
        contactToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        return contactToken;
    }

    private final DefaultMessageService messageService = NurigoApp.INSTANCE.initialize("NCSNH0OALXVLKW0T", "PUHZZGMDQQDCBTWYNH43L8MNHMOI34YY", "https://api.coolsms.co.kr");
    private final ContactTokenMapper contactTokenMapper;

    @Autowired
    public ContactTokenService(ContactTokenMapper contactTokenMapper) {
        this.contactTokenMapper = contactTokenMapper;
    }

    public ResultTuple<ContactTokenEntity> invokeContactToken(String which, String contactFirst, String contactSecond, String contactThird, String userAgent) {
        if (!UserRegex.contactFirst.matches(contactFirst) || !UserRegex.contactSecond.matches(contactSecond) || !UserRegex.contactThird.matches(contactThird) || userAgent == null) {
            return ResultTuple.<ContactTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        ContactTokenEntity contactToken = generateContactToken(userAgent, contactFirst, contactSecond, contactThird);
        if (this.contactTokenMapper.insert(contactToken) < 1) {
            return ResultTuple.<ContactTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        Message message = new Message();
        message.setFrom("01092910416");
        message.setTo(contactFirst + contactSecond + contactThird);
        message.setText(String.format("[PLAN:AT] %s 인증 번호는 %s입니다.", which, contactToken.getCode()));
        this.messageService.sendOne(new SingleMessageSendingRequest(message));
        return ResultTuple.<ContactTokenEntity>builder()
                .payload(contactToken)
                .result(CommonResult.SUCCESS)
                .build();
    }

    public Result verifyContactToken(ContactTokenEntity contactToken) {
        if (contactToken == null ||
                !UserRegex.contactFirst.matches(contactToken.getContactFirst()) ||
                !UserRegex.contactSecond.matches(contactToken.getContactSecond()) ||
                !UserRegex.contactThird.matches(contactToken.getContactThird()) ||
                !ContactTokenRegex.code.matches(contactToken.getCode()) ||
                !ContactTokenRegex.salt.matches(contactToken.getSalt())) {
            System.out.println(1);
            return CommonResult.FAILURE;
        }
        ContactTokenEntity dbContactToken = this.contactTokenMapper.selectContactAndCodeSalt(contactToken.getContactFirst(), contactToken.getContactSecond(), contactToken.getContactThird(), contactToken.getCode(), contactToken.getSalt());
        if (dbContactToken == null ||
                !dbContactToken.getUserAgent().equals(contactToken.getUserAgent()) ||
                dbContactToken.isUsed()) {

            return CommonResult.FAILURE;
        }
        if (dbContactToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return VerifyContactTokenResult.FAILURE_EXPIRED;
        }
        dbContactToken.setUsed(true);
        return this.contactTokenMapper.update(dbContactToken) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}





















