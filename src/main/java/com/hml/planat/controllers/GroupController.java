package com.hml.planat.controllers;

import com.hml.planat.entities.groups.GroupEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.GroupService;
import com.hml.planat.vos.GroupUserVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/group")
@CrossOrigin(origins = "*")
public class GroupController {
    private final GroupService groupService;

    @Autowired
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // 속해있는 그룹 불러오기
    @RequestMapping(value = "/active", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public GroupUserVo[] getActive(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new GroupUserVo[0];
        }
        ResultTuple<GroupUserVo[]> result = this.groupService.getActiveByUserEmail(signedUser.getEmail());
        return result.getPayload();
    }

    // 그룹 사용자 초대하기
    @RequestMapping(value = "/request", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestParam(value = "groupId", required = false) int groupId,
                                   @RequestParam(value = "email", required = false) String email,
                                   @RequestParam(value = "nickname", required = false) String nickname) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.addGroupUser(signedUser, groupId, email, nickname);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹에서 제명시키기
    @RequestMapping(value = "/user", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteUser(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "groupId", required = false) int groupId,
                             @RequestParam(value = "userEmail", required = false) String userEmail) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.deleteGroupUser(signedUser, groupId, userEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 탈퇴
    @RequestMapping(value = "/self", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteSelf(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "groupId", required = false) int groupId) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.withdrawGroup(signedUser, groupId);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 초대 수락한 유저목록 가져오기
    @RequestMapping(value = "/users", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public GroupUserVo[] getUsers(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                         @RequestParam(value = "groupId", required = false) int groupId) {
        if (signedUser == null) {
            return new GroupUserVo[0];
        }
        ResultTuple<GroupUserVo[]> result = this.groupService.getGrantedUsersByGroupId(groupId);
        return result.getPayload();
    }

    // 초대 요청한 user 불러오기
    @RequestMapping(value = "/sent", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public GroupUserVo[] getSent(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new GroupUserVo[0];
        }
        ResultTuple<GroupUserVo[]> result = this.groupService.getPendingUsersByUserEmail(signedUser.getEmail());
        return result.getPayload();
    }

    // 초대받은 그룹 불러오기
    @RequestMapping(value = "/received", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public GroupUserVo[] getReceived(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return new GroupUserVo[0];
        }
        ResultTuple<GroupUserVo[]> result = this.groupService.getReceivedByUserEmail(signedUser.getEmail());
        return result.getPayload();
    }

    // 그룹 초대 수락
    @RequestMapping(value = "/request", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                  @RequestParam(value = "groupId", required = false) int groupId) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.acceptInvitation(signedUser, groupId);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 초대 거절
    @RequestMapping(value = "/request", method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String putRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestParam(value = "groupId", required = false) int groupId) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.declineInvitation(signedUser, groupId);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 초대 요청 취소
    @RequestMapping(value = "/request", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteRequest(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                       @RequestParam(value = "groupId") int groupId,
                                       @RequestParam(value = "userEmail") String userEmail) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.deleteSentInvitation(signedUser, groupId, userEmail);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 추가
    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postGroup(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            GroupEntity group) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.addGroup(signedUser, group);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 수정
    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchGroup(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUSer,
                             GroupEntity group) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.updateGroup(signedUSer, group);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 그룹 삭제
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteGroup(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              int id) {
        JSONObject response = new JSONObject();
        Result result = this.groupService.deleteGroup(signedUser, id);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
