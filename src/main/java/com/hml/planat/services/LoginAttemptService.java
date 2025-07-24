package com.hml.planat.services;

import com.hml.planat.entities.users.LoginAttemptEntity;
import com.hml.planat.mappers.LoginAttemptMapper;
import com.hml.planat.results.CommonResult;
import com.hml.planat.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private final LoginAttemptMapper loginAttemptMapper;

    @Autowired
    public LoginAttemptService(LoginAttemptMapper loginAttemptMapper) {
        this.loginAttemptMapper = loginAttemptMapper;
    }

    public Result add(LoginAttemptEntity loginAttempt) {
        if (loginAttempt == null) {
            return CommonResult.FAILURE;
        }
        return this.loginAttemptMapper.insert(loginAttempt) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
