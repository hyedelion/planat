package com.hml.planat.controllers;

import com.hml.planat.entities.schedules.ScheduleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.ScheduleService;
import com.hml.planat.vos.ScheduleVo;
import org.apache.ibatis.annotations.Param;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
@RequestMapping(value = "/schedule")
@CrossOrigin(origins = "*")
public class ScheduleController {
    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // 일정 추가
    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            ScheduleEntity schedule) {
        JSONObject response = new JSONObject();
        Result result = this.scheduleService.addIndex(signedUser, schedule);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ScheduleVo getIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               @RequestParam(value = "id", required = false) int id) {
        ResultTuple<ScheduleVo> result = this.scheduleService.getIndex(signedUser, id);
        return result.getPayload();
    }

    // 전체 일정 불러오기
    @RequestMapping(value = "/query", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ScheduleEntity[] getQuery(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                                  @RequestParam(value = "from", required = false) LocalDateTime from,
                                                  @RequestParam(value = "to", required = false) LocalDateTime to) {
        ResultTuple<ScheduleEntity[]> result = this.scheduleService.getAllQuery(signedUser, from, to);
        return result.getPayload();
    }

    // 일정 삭제
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "id", required = false) int id) {
        JSONObject response = new JSONObject();
        Result result = this.scheduleService.deleteIndex(signedUser, id);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 일정 수정
    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             ScheduleEntity schedule) {
        JSONObject response = new JSONObject();
        Result result = this.scheduleService.patchIndex(signedUser, schedule);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
