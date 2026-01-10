package com.example.gts_project.user;

import com.example.gts_project.user.userServiceImpl;
import com.example.gts_project.user.userVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
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


}