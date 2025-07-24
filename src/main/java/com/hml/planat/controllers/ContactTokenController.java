package com.hml.planat.controllers;

import com.hml.planat.entities.users.ContactTokenEntity;
import com.hml.planat.entities.users.EmailTokenEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.ContactTokenService;
import com.hml.planat.services.UserService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/contact-token")
public class ContactTokenController {
    private final ContactTokenService contactTokenService;
    private final UserService userService;

    @Autowired
    public ContactTokenController(ContactTokenService contactTokenService, UserService userService) {
        this.contactTokenService = contactTokenService;
        this.userService = userService;
    }

    @RequestMapping(value = "/sms", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchSms(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "type", required = false) String type,
                           @RequestHeader(value = "User-Agent", required = false) String userAgent,
                           ContactTokenEntity contactToken) {
        contactToken.setUserAgent(userAgent);
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        Result result = this.contactTokenService.verifyContactToken(contactToken);
        response.put("result", result.toStringLower());
        if (result == CommonResult.SUCCESS && type != null && type.equals("recoverEmail")) {
            ResultTuple<UserEntity[]> resultTuple = this.userService.getUsersByContact(contactToken.getContactFirst(), contactToken.getContactSecond(), contactToken.getContactThird());
            UserEntity[] users = resultTuple.getPayload();
            JSONArray emails = new JSONArray();
            for (UserEntity user : users) {
                emails.put(user.getEmail());
            }
            response.put("emails", emails);
        }
        return response.toString();
    }

    @RequestMapping(value = "/sms", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postSms(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                          @RequestParam(value = "contactFirst", required = false) String contactFirst,
                                          @RequestParam(value = "contactSecond", required = false) String contactSecond,
                                          @RequestParam(value = "contactThird", required = false) String contactThird,
                                          @RequestParam(value = "type", required = false) String type,
                                          @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        String which = switch (type) {
            case "register" -> "회원가입";
            case "recoverEmail" -> "이메일 찾기";
            case "recoverPassword" -> "비밀번호 재설정";
            default -> null;
        };
        if (which == null) {
            response.put("result", CommonResult.FAILURE.toStringLower());
            return response.toString();
        }
        ResultTuple<ContactTokenEntity> result = this.contactTokenService.invokeContactToken(which, contactFirst, contactSecond, contactThird, userAgent);
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            response.put("salt", result.getPayload().getSalt());
        }
        return response.toString();
    }
}
