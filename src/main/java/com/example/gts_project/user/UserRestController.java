package com.example.gts_project.user;

import com.example.gts_project.user.userServiceImpl;
import com.example.gts_project.user.userVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/data")
// @RestController 사용: 클래스 상단에 @Controller 대신 @RestController를 사용하면
// 모든 메서드에 자동으로 @ResponseBody가 적용되어 JSON 데이터를 반환합니다.
public class UserRestController {

    @Autowired
    private userServiceImpl userService;


    @PostMapping("/user/save")
    public int saveUser(userVO vo){
        return userService.saveUser(vo);
    }
    @PostMapping("/user/update")
    public int updateUser(userVO vo){return userService.updateUser(vo);}
    @PostMapping("/user/delete")
    public int deleteUser(int personId){return userService.deleteUser(personId);}



    @GetMapping("users/userType")
    public List<userVO> getUserByUserType(int userType){return userService.getUserListByUserType(userType);}
    @GetMapping("user/PID")
    public userVO getUser(int personId){return userService.getUser(personId);}
    @GetMapping("user/userName")
    public userVO getUserByUserName(String userName){return userService.getUserByUserName(userName);}
    @GetMapping("/user/cnt")
    public int getUserCnt(){return userService.getUserCnt();}
    @GetMapping("users")
    public List<userVO> getUserList(){return userService.getUserList();}

    @PostMapping("/user/login")
    public ResponseEntity<?> login(@RequestParam String userName, @RequestParam String password, HttpSession session) {
        userVO user = userService.getUserByUserName(userName);
        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("user", user); // 세션에 저장
            return ResponseEntity.ok(user);    // 로그인 성공 시 유저 정보 반환
        }
        return ResponseEntity.status(401).body("로그인 실패");
    }
}