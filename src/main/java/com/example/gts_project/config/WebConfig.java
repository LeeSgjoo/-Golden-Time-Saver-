package com.example.gts_project.config;

import com.example.gts_project.user.LoginCheckInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginCheckInterceptor())
                .addPathPatterns("/**") // 모든 경로 검사
                .excludePathPatterns(
                        "/", "/index.html", "/static/**", "/resources/**",
                        "/auth/**", "/api/auth/**", "/favicon.ico", "/manifest.json"
                ); // 로그인이 필요 없는 경로들 (XML에 있던 내용)
    }
}