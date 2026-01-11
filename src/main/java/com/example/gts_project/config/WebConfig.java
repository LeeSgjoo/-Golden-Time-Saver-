package com.example.gts_project.config;

import com.example.gts_project.user.LoginCheckInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 인터셉터 등록: 로그인 여부를 체크하여 비로그인 사용자의 접근을 차단합니다.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginCheckInterceptor())
                .addPathPatterns("/**") // 모든 요청에 대해 로그인 체크 실행
                .excludePathPatterns(
                        "/",                // 메인(로그인) 페이지
                        "/login",           // 로그인 처리 API
                        "/static/**",       // 리액트 빌드 정적 파일 (JS, CSS 등)
                        "/resources/**",    // 기타 정적 리소스
                        "/favicon.ico",     // 브라우저 아이콘
                        "/manifest.json",   // 앱 설정 파일
                        "/auth/**",         // 인증 관련 경로
                        "/api/auth/**"      // 인증 API 경로
                );
    }

    /**
     * 정적 리소스 핸들러: XML의 <mvc:resources> 설정을 대체합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}