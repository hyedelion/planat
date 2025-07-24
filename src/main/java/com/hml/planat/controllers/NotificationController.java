package com.hml.planat.controllers;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.NotificationService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/notification")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public NotificationEntity[] getAll(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new NotificationEntity[0];
        }
        ResultTuple<NotificationEntity[]> result = this.notificationService.getAll(signedUser.getEmail());
        return result.getPayload();
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String delete(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "ids", required = false) int[] ids) {
        JSONObject response = new JSONObject();
        Result result = this.notificationService.delete(signedUser, ids);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchNotification(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                    @RequestParam(value = "ids", required = false) int[] ids) {
        JSONObject response = new JSONObject();
        Result result = this.notificationService.isRead(signedUser, ids);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
