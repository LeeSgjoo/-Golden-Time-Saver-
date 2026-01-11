package com.example.gts_project.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController implements ErrorController {

    // "forward:/index.html" 대신 "index.html" (설정된 suffix에 의해 매핑됨)
    // 또는 아래와 같이 경로를 명시합니다.
    @GetMapping({"/", "/login", "/emt", "/hospital", "/center"})
    public String index() {
        return "index";
    }

    @GetMapping("/error")
    public String handleError() {
        return "index";
    }
}