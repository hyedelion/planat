package com.hml.planat.controllers;


import com.hml.planat.entities.users.*;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.*;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Controller
@RequestMapping(value = "/user")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    private final EmailTokenService emailTokenService;
    private final ContactMvnoService contactMvnoService;
    private final LoginAttemptService loginAttemptService;

    @Autowired
    public UserController(UserService userService, EmailTokenService emailTokenService, ContactMvnoService contactMvnoService, LoginAttemptService loginAttemptService) {
        this.userService = userService;
        this.emailTokenService = emailTokenService;
        this.contactMvnoService = contactMvnoService;
        this.loginAttemptService = loginAttemptService;
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogin(@SessionAttribute(value = "signedUser", required = false) UserEntity user ,
                           Model model) {
        if (user != null) {
            return "redirect:/";
        }
        model.addAttribute("contactMvnos", this.contactMvnoService.getAll());
        return "user/login";
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "email", required = false) String email,
                            @RequestParam(value = "password", required = false) String password,
                            HttpServletRequest request,
                            HttpSession session) {
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        ResultTuple<UserEntity> result = this.userService.login(email, password);
        LoginAttemptEntity loginAttempt = LoginAttemptEntity.builder()
                .email(email)
                .ip(request.getRemoteAddr())
                .ua(request.getHeader("User-Agent"))
                .result(result.getResult().name())
                .createdAt(LocalDateTime.now())
                .build();
        this.loginAttemptService.add(loginAttempt);

        if (result.getResult() == CommonResult.SUCCESS) {
            System.out.println(result.getPayload());
            session.setAttribute("signedUser", result.getPayload());
        }

        response.put("result", result.getResult().toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/nickname-check", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postNicknameCheck(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                    @RequestParam(value = "nickname", required = false) String nickname) {
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        Result result = userService.checkNickname(nickname);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               @RequestParam(value = "emailCode", required = false) String emailCode,
                               @RequestParam(value = "emailSalt", required = false) String emailSalt,
                               @RequestParam(value = "contactCode", required = false) String contactCode,
                               @RequestParam(value = "contactSalt", required = false) String contactSalt,
                               @RequestParam(value = "marketingChecked", required = false) boolean marketingChecked,
                               @RequestHeader(value = "User-Agent", required = false) String userAgent,
                               EmailTokenEntity emailToken,
                               ContactTokenEntity contactToken,
                               UserEntity user) {
        emailToken.setCode(emailCode);
        emailToken.setSalt(emailSalt);
        emailToken.setUserAgent(userAgent);
        contactToken.setCode(contactCode);
        contactToken.setSalt(contactSalt);
        contactToken.setUserAgent(userAgent);
        if (marketingChecked) {
            user.setTermMarketingAt(LocalDate.now());
        } else {
            user.setTermMarketingAt(null);
        }
        Result result = this.userService.register(emailToken, contactToken, user);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        if (result == CommonResult.SUCCESS) {
            response.put("salt", emailToken.getSalt());
            response.put("salt", contactToken.getSalt());
        }
        return response.toString();
    }

    @RequestMapping(value = "/recover-password", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRecoverPassword(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                       @RequestParam(value = "email", required = false) String email,
                                       @RequestParam(value = "password", required = false) String password,
                                       ContactTokenEntity contactToken) {
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        Result result = this.userService.recoverPassword(email, password, contactToken);
        response.put("result", result.toStringLower());
        return response.toString();
    }


}
