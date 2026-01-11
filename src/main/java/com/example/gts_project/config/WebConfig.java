package com.example.gts_project.config;

import com.example.gts_project.user.LoginCheckInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 인터셉터 등록:
     * LoginCheckInterceptor가 정상 동작하도록 경로를 설정합니다.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginCheckInterceptor())
                .addPathPatterns("/**") // 모든 경로에 대해 로그인 체크 수행
                .excludePathPatterns(
                        "/",                // 메인 페이지(컨트롤러 매핑)
                        "/index.html",      // 리액트 메인 파일
                        "/static/**",       // 리액트 빌드 정적 리소스
                        "/resources/**",    // 기타 리소스
                        "/auth/**",         // 로그인/회원가입 관련 API
                        "/api/auth/**",     // 인증 관련 API
                        "/favicon.ico",
                        "/manifest.json"
                );
    }

    /**
     * 정적 리소스 핸들러:
     * XML의 <mvc:resources> 설정을 대체하여 static 폴더를 직접 읽게 합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}