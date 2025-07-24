package com.hml.planat.controllers;

import com.hml.planat.entities.articles.ArticleEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.ArticleService;
import com.hml.planat.vos.ArticleVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/article")
@CrossOrigin(origins = "*")
public class ArticleController {
    private final ArticleService articleService;

    @Autowired
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }
    // 특정 스케줄의 모든 게시글 불러오기
    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ArticleVo[] getAll(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                  @RequestParam(value = "scheduleId", required = false) int scheduleId) {
        if (signedUser == null) {
            return new ArticleVo[0];
        }
        ResultTuple<ArticleVo[]> result = this.articleService.getAllArticles(signedUser, scheduleId);
        return result.getPayload();
    }

    // 특정 스케줄에 게시글 작성하기
    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            ArticleEntity articleEntity) {
        JSONObject response = new JSONObject();
        Result result = this.articleService.writeArticle(signedUser, articleEntity);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 게시글 수정하기
    @RequestMapping(value = "/", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             ArticleEntity articleEntity) {
        JSONObject response = new JSONObject();
        Result result = this.articleService.updateArticle(signedUser, articleEntity);
        response.put("result", result.toStringLower());
        return response.toString();
    }

    // 게시글 삭제하기
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "id", required = false) int id) {
        JSONObject response = new JSONObject();
        Result result = this.articleService.deleteArticle(signedUser, id);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
