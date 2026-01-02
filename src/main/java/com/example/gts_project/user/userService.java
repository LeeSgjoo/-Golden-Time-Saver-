package com.example.gts_project.user;

import java.util.List;

public interface userService {

    public int saveUser(userVO userVO);
    public int updateUser(userVO userVO);
    public int deleteUser(int personId);

    public userVO getUser(int personId);
    public userVO getUserByUserName(String userName);
    public int getUserCnt();
    public List<userVO> getUserList();
    public List<userVO> getUserListByUserType(int userType);
}