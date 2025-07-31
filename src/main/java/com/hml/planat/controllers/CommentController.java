package com.hml.planat.controllers;

import com.hml.planat.entities.comments.CommentEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.CommentService;
import com.hml.planat.vos.CommentVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.xml.stream.events.Comment;

@Controller
@RequestMapping(value = "/comment")
@CrossOrigin(origins = "*")
public class CommentController {
    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // 댓글 불러오기
    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public CommentVo[] getAll(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                  @RequestParam(value = "articleId", required = false) int articleId) {
        if (signedUser == null) {
            return new CommentVo[0];
        }
        ResultTuple<CommentVo[]> result = this.commentService.getAllComments(signedUser, articleId);
        return result.getPayload();
    }

    // 댓글 쓰기
    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              CommentEntity comment) {
        JSONObject response = new JSONObject();
        Result result = this.commentService.writeComment(signedUser, comment);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 댓글 수정
    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               CommentEntity comment) {
        JSONObject response = new JSONObject();
        Result result = this.commentService.updateComment(signedUser, comment);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 댓글 삭제
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                @RequestParam(value = "id", required = false) int id) {
        JSONObject response = new JSONObject();
        Result result = this.commentService.deleteComment(signedUser, id);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
