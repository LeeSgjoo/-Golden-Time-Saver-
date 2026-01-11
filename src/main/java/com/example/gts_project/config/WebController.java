package com.example.gts_project.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    /**
     * 루트 경로("/") 접속 시 static 폴더의 index.html로 연결합니다.
     * "index"만 리턴할 경우 뷰 리졸버 충돌이 발생할 수 있으므로,
     * 정적 리소스 경로로 직접 리다이렉트하거나 포워드하는 것이 안전합니다.
     */
    @GetMapping("/")
    public String index() {
        // 'forward:' 접두사를 붙여 static/index.html 파일을 직접 호출하도록 합니다.
        // 이 방식은 URL 주소는 그대로 유지하면서 화면만 index.html을 보여줍니다.
        return "forward:/index.html";
    }
}