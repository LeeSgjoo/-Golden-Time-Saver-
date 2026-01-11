package com.example.gts_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class GtsProjectApplication extends SpringBootServletInitializer {

    // WAR 배포와 java -jar 실행을 모두 지원하기 위한 설정
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(GtsProjectApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(GtsProjectApplication.class, args);
    }
}