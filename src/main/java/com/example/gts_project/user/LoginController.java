package com.example.gts_project.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController // 데이터를 리턴하기 위해 RestController 사용
@RequestMapping("/api/auth") // API 경로임을 명시
public class LoginController {

    @Autowired
    private userServiceImpl userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(HttpSession session, @RequestBody userVO userVO) {
        Map<String, Object> response = new HashMap<>();

        // 기존 세션 제거
        if (session.getAttribute("user") != null) {
            session.removeAttribute("user");
        }

        // DB에서 사용자 정보 확인 (기존 로직 활용)
        // 유저 이름으로 해당되는 유저 객체를 받아오기
        userVO realVO = userService.getUserByUserName(userVO.getUserName());

        if (realVO != null && realVO.getPassword().equals(userVO.getPassword())) {
            session.setAttribute("user", realVO); // 세션 저장
            response.put("success", true);
            response.put("user", realVO); // 리액트에서 쓸 사용자 정보 전달
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }
}