package com.hml.planat.interceptors;

import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.entities.users.UserTrackEntity;
import com.hml.planat.mappers.UserTrackMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class UserInterceptor implements HandlerInterceptor {
    @Autowired
    private UserTrackMapper userTrackMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object signedUserObj = request.getSession().getAttribute("signedUser");
        if (signedUserObj instanceof UserEntity signedUser) {
            UserTrackEntity userTrack = userTrackMapper.selectByUserEmail(signedUser.getEmail());
            if (userTrack == null) {
                userTrack = UserTrackEntity.builder()
                        .userEmail(signedUser.getEmail())
                        .build();
            }
            userTrack.setRequestUri(request.getRequestURI());
            userTrack.setRequestParam(request.getQueryString());
            userTrack.setClientIp(request.getRemoteAddr());
            userTrack.setClientUa(request.getHeader("User-Agent"));
            userTrack.setUpdatedAt(LocalDateTime.now());
            userTrackMapper.insert(userTrack);
        }
        return true;
    }
}