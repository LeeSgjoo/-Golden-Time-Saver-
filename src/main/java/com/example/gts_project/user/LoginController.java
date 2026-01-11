package com.example.gts_project.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

// 1. 리액트(3000포트) 접속 허용 및 세션 쿠키 공유(allowCredentials) 설정
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private userServiceImpl userService;

    @PostMapping("/login_ok")
    public ResponseEntity<Map<String, Object>> loginOk(HttpSession session, @RequestBody userVO userVO) {
        Map<String, Object> result = new HashMap<>();

        // 기존 세션 초기화
        if (session.getAttribute("user") != null) {
            session.removeAttribute("user");
        }

        // 2. UserVO의 userName 필드를 사용하여 DB 조회
        // (리액트에서 userName이라는 키로 데이터를 보내면 자동으로 바인딩됩니다.)
        userVO realVO = userService.getUserByUserName(userVO.getUserName());

        if (realVO != null && realVO.getPassword().equals(userVO.getPassword())) {
            // 로그인 성공: 세션에 유저 정보 저장
            session.setAttribute("user", realVO);

            result.put("success", true);
            result.put("user", realVO); // 리액트에서 권한 체크를 위해 유저 객체 전달
            return ResponseEntity.ok(result);
            /*
            로그인에 성공했을 때, 백엔드는 단순히 "성공했다"는 신호만 보내는 게 아니라, DB에서 가져온 realVO 객체 전체를 JSON에 담아서 리액트에게 던져줍니다.
            리액트의 response.data.user는 바로 이 realVO 데이터를 말합니다.
             */
        } else {
            // 로그인 실패
            result.put("success", false);
            result.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logout Success");
    }
}