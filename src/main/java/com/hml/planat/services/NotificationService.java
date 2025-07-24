package com.hml.planat.services;

import com.hml.planat.entities.NotificationEntity;
import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.mappers.NotificationMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import com.hml.planat.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttribute;

@Service
public class NotificationService {
    private final NotificationMapper notificationMapper;

    @Autowired
    public NotificationService(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    public ResultTuple<NotificationEntity[]> getAll(String targetUserEmail) {
        if (targetUserEmail == null) {
            return ResultTuple.<NotificationEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<NotificationEntity[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.notificationMapper.selectAllByTargetUserEmail(targetUserEmail))
                .build();
    }

    public Result delete(UserEntity signedUser, int[] ids) {
        for (int id : ids) {
            NotificationEntity notification = this.notificationMapper.selectById(id);
            // 이게 null 이면 continue
            if (notification == null) {
                continue;
            }
            // 이게 signedUser를 위한 노티가 아니면 continue
            if (!notification.getTargetUserEmail().equals(signedUser.getEmail())) {
                continue;
            }
            // 여기서 return 치면 for 문이 안 돌잖에
            // 걍 delete
            this.notificationMapper.deleteById(id);
        }
        // 리튼 슥세스
        return CommonResult.SUCCESS;
    }

    public Result isRead(UserEntity signedUser, int[] ids) {
        for (int id : ids) {
            NotificationEntity notification = this.notificationMapper.selectById(id);
            if (notification == null) {
                continue;
            }
            if (!notification.getTargetUserEmail().equals(signedUser.getEmail())) {
                continue;
            }
            notification.setRead(true);
            this.notificationMapper.update(notification);
        }
        return CommonResult.SUCCESS;
    }
}
