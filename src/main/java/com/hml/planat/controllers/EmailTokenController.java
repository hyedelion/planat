package com.hml.planat.controllers;

import com.hml.planat.entities.users.EmailTokenEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.EmailTokenService;
import com.hml.planat.services.UserService;
import jakarta.mail.MessagingException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/email-token")
public class EmailTokenController {
    private final EmailTokenService emailTokenService;
    private final UserService userService;

    @Autowired
    public EmailTokenController(EmailTokenService emailTokenService, UserService userService) {
        this.emailTokenService = emailTokenService;
        this.userService = userService;
    }

    @RequestMapping(value = "/email", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchEmail(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                     EmailTokenEntity emailToken,
                                     @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        emailToken.setUserAgent(userAgent);
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        Result result = this.emailTokenService.verifyEmailToken(emailToken);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postEmail(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "email", required = false) String email,
                            @RequestParam(value = "type", required = false) String type,
                            @RequestHeader(value = "User-Agent", required = false) String userAgent) throws MessagingException {
        JSONObject response = new JSONObject();
        if (signedUser != null) {
            response.put("result", CommonResult.FAILURE_SIGNED.toStringLower());
            return response.toString();
        }
        if (type != null && type.equals("register")) {
            if (this.userService.checkEmail(email) != CommonResult.SUCCESS) {
                response.put("result", CommonResult.FAILURE_DUPLICATE.toStringLower());
            }
        }
        ResultTuple<EmailTokenEntity> result = this.emailTokenService.invokeEmailToken(type, email, userAgent);
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            response.put("salt", result.getPayload().getSalt());
        }
        return response.toString();
    }

}
