package com.hml.planat.interceptors;

import com.hml.planat.entities.users.UserEntity;
import com.hml.planat.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class DevInterceptor implements HandlerInterceptor {
    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();
        if (session.getAttribute("signedUser") == null) {
            String ip = request.getRemoteAddr();
            UserEntity signingUser = null;
            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("127.0.0.1")) {
                signingUser = this.userService.getUserByEmail("hyemin9291@gmail.com");
            } else if (ip.equals("172.17.0.26")) {
                signingUser = this.userService.getUserByEmail("inst.yhp@gmail.com");
            }
            session.setAttribute("signedUser", signingUser);
        }
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }
}
