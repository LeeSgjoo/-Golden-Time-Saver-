package com.example.gts_project.user;

import com.example.gts_project.user.userDAO;
import com.example.gts_project.user.userService;
import com.example.gts_project.user.userVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class userServiceImpl implements userService {

    @Autowired
    private userDAO userDAO;

    @Override
    public int saveUser(userVO userVO) {
        System.out.println("UserServiceImpl 실행: DB 저장 로직 수행");
        return userDAO.insertUser(userVO);
    }
    @Override
    public int updateUser(userVO userVO) {
        return userDAO.updateUser(userVO);
    }
    @Override
    public int deleteUser(int personId) {
        return userDAO.deleteUser(personId);
    }


    @Override
    public List<userVO> getUserListByUserType(int userType) {
        return userDAO.getUserListByUserType(userType);
    }
    @Override
    public userVO getUser(int personId) {
        return userDAO.getUser(personId);
    }
    @Override
    public int getUserCnt() {
        return userDAO.getUserCnt();
    }
    @Override
    public List<userVO> getUserList() {
        return userDAO.getUserList();
    }
}
