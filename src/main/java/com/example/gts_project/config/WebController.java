package com.example.gts_project.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController implements ErrorController {

    // API를 제외한 모든 경로를 index.html로 포워딩 (리액트 라우팅 지원)
    @GetMapping({"/", "/login", "/emt", "/hospital", "/center"})
    public String index() {
        return "forward:/index.html";
    }
}
