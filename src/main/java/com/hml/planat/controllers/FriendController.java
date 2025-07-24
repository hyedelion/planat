package com.hml.planat.controllers;

import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.users.FriendEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.FriendService;
import com.hml.planat.vos.FriendVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/friend")
@CrossOrigin(origins = "*")
public class FriendController {
    private final FriendService friendService;

    @Autowired
    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    // 친구 불러오기
    @RequestMapping(value = "/active", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public FriendVo[] getActive(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new FriendVo[0];
        }
        ResultTuple<FriendVo[]> result = this.friendService.getAllFriends(signedUser);
        for (FriendVo friend : result.getPayload()) {
            if (friend.getRequesterUserEmail().equals(signedUser.getEmail())) {
                // 내가 요청 보낸 사람이면 -> 요청 보낸 사람 정보 삭제
                friend.setRequesterUserEmail(null);
                friend.setRequesterUserNickname(null);
            } else {
                // 내가 요청 받은 사람이면 -> 요청 받은 사람 정보 삭제
                friend.setRequesteeUserEmail(null);
                friend.setRequesteeUserNickname(null);
            }
        }
        return result.getPayload();
    }

    // 친구 끊기
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteRelationship(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                     @RequestParam(value = "friendEmail", required = false) String friendEmail) {
        JSONObject response = new JSONObject();
        Result result = this.friendService.deleteRelationship(signedUser, friendEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 친구 신청
    @RequestMapping(value = "/request", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "email", required = false) String email,
                              @RequestParam(value = "nickname", required = false) String nickname) {
        JSONObject response = new JSONObject();
        Result result = this.friendService.addRequest(signedUser, email, nickname);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 보낸 친구 신청 내역
    @RequestMapping(value = "/sent", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public FriendVo[] getSent(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new FriendVo[0];
        }
        ResultTuple<FriendVo[]> result = this.friendService.getSent(signedUser.getEmail());
        return result.getPayload();
    }

    // 받은 친구 신청 내역
    @RequestMapping(value = "/received", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public FriendVo[] getReceived(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new FriendVo[0];
        }
        ResultTuple<FriendVo[]> result = this.friendService.getReceived(signedUser.getEmail());
        return result.getPayload();
    }

    // 친구 요청 수락
    @RequestMapping(value = "/request", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "requesterUserEmail", required = false) String requesterUserEmail) {
        JSONObject response = new JSONObject();
        Result result = this.friendService.acceptRequest(signedUser, requesterUserEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 친구 요청 거절
    @RequestMapping(value = "/request", method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "requesterUserEmail", required = false) String requesterUserEmail) {
        JSONObject response = new JSONObject();
        Result result = this.friendService.declineRequest(signedUser, requesterUserEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 친구 요청 취소
    @RequestMapping(value = "/request", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                String requesteeUserEmail) {
        JSONObject response = new JSONObject();
        Result result = this.friendService.cancelRequest(signedUser, requesteeUserEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

}
