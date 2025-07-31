package com.hml.planat.controllers;

import com.hml.planat.entities.attachments.AttachmentEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.AttachmentMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import com.hml.planat.services.AttachmentService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping(value = "/attachment")
@CrossOrigin(origins = "*")
public class AttachmentController {
    private final AttachmentService attachmentService;
    private final AttachmentMapper attachmentMapper;

    @Autowired
    public AttachmentController(AttachmentService attachmentService, AttachmentMapper attachmentMapper) {
        this.attachmentService = attachmentService;
        this.attachmentMapper = attachmentMapper;
    }

    // 첨부파일 불러오기
    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public AttachmentEntity[] getAllAttachments(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                                @RequestParam(value = "scheduleId", required = false) Integer scheduleId,
                                                @RequestParam(value = "articleId", required = false) Integer articleId) {
        JSONObject response = new JSONObject();
        ResultTuple<AttachmentEntity[]> result = this.attachmentService.getAll(signedUser, scheduleId, articleId);
        response.put("result", result.getPayload());
        return result.getPayload();
    }

    // 첨부파일 첨부하기
    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postAttachment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                 @RequestParam(value = "_file", required = false) MultipartFile file,
                                 AttachmentEntity attachment) throws IOException {
        attachment.setUserEmail(signedUser.getEmail());
        attachment.setName(file.getOriginalFilename()); // MultipartFile를 통해 전송 받은 파일 이름
        attachment.setContentType(file.getContentType()); // MultipartFile를 통해 전송 받은 파일 타입
        attachment.setData(file.getBytes()); // MultipartFile를 통해 전송 받은 파일 실제 데이터
        attachment.setSize(file.getSize()); // MultipartFile를 통해 전송 받은 파일 데이터의 크기(Byte 단위)
        ResultTuple<Integer> result = this.attachmentService.upload(signedUser, attachment);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            // 성공했을때 방금 업로드한 파일의 식별자(id)를 돌려줘야함. 그래야 다운로드 하니까
            response.put("id", result.getPayload());
        }
        return response.toString();
    }

    // 다운로드하기
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> getAttachment(@RequestParam(value = "id", required = false) int id) {
        AttachmentEntity attachment = this.attachmentMapper.selectById(id);
        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getName() + "\"")
                .contentLength(attachment.getData().length)
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .body(attachment.getData());
    }

    // 첨부파일 삭제
    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteAttachment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestParam(value = "id", required = false) int id) {
        JSONObject response = new JSONObject();
        Result result = this.attachmentService.deleteAttachment(signedUser, id);
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
