package com.hml.planat.services;

import com.hml.planat.entities.users.EmailTokenEntity;
import com.hml.planat.mappers.EmailTokenMapper;
import com.hml.planat.regexes.EmailTokenRegex;
import com.hml.planat.regexes.UserRegex;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.results.email_token.VerifyEmailTokenResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;

@Service
public class EmailTokenService {
    public static EmailTokenEntity generateEmailToken(String email, String userAgent) {
        String code = RandomStringUtils.randomNumeric(6);
        String salt = RandomStringUtils.randomAlphanumeric(128);
        EmailTokenEntity emailToken = new EmailTokenEntity();
        emailToken.setEmail(email);
        emailToken.setCode(code);
        emailToken.setSalt(salt);
        emailToken.setUserAgent(userAgent);
        emailToken.setUsed(false);
        emailToken.setCreatedAt(LocalDateTime.now());
        emailToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        return emailToken;
    }

    private final EmailTokenMapper emailTokenMapper;
    private final JavaMailSender javamailSender;
    private final SpringTemplateEngine springtemplateEngine;

    @Autowired
    public EmailTokenService(EmailTokenMapper emailTokenMapper, JavaMailSender javamailSender, SpringTemplateEngine springtemplateEngine) {
        this.emailTokenMapper = emailTokenMapper;
        this.javamailSender = javamailSender;
        this.springtemplateEngine = springtemplateEngine;
    }

    public ResultTuple<EmailTokenEntity> invokeEmailToken(String type, String email, String userAgent) throws MessagingException {
        if (!UserRegex.email.matches(email) || userAgent == null) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        EmailTokenEntity emailToken = generateEmailToken(email, userAgent);
        if (this.emailTokenMapper.insert(emailToken) < 1) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        Context context = new Context();
        context.setVariable("code", emailToken.getCode());
        String mailText = this.springtemplateEngine.process(switch (type) {
            case "register" -> "user/register-email";
            default -> throw new IllegalStateException("Unexpected value: " + type);
        }, context);
        MimeMessage mimeMessage = this.javamailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
        mimeMessageHelper.setFrom("hyemin9291@gmail.com");
        mimeMessageHelper.setTo(emailToken.getEmail());
        mimeMessageHelper.setSubject(String.format("[PLAN:AT] %s 인증번호", switch (type) {
            case "register" -> "회원가입";
            default -> throw new IllegalStateException("Unexpected value: " + type);
        }));
        mimeMessageHelper.setText(mailText, true);
        this.javamailSender.send(mimeMessage);

        return ResultTuple.<EmailTokenEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(emailToken)
                .build();
    }

    public Result verifyEmailToken(EmailTokenEntity emailToken) {
        if (emailToken == null ||
        !UserRegex.email.matches(emailToken.getEmail()) ||
        !EmailTokenRegex.code.matches(emailToken.getCode()) ||
        !EmailTokenRegex.salt.matches(emailToken.getSalt())) {
            return CommonResult.FAILURE;
        }
        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectEmailAndCodeSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());
        if (dbEmailToken == null ||
        !dbEmailToken.getUserAgent().equals(emailToken.getUserAgent()) ||
        dbEmailToken.isUsed()) {
            return CommonResult.FAILURE;
        }
        if (dbEmailToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return VerifyEmailTokenResult.FAILURE_EXPIRED;
        }
        dbEmailToken.setUsed(true);
        return this.emailTokenMapper.update(dbEmailToken) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}





















