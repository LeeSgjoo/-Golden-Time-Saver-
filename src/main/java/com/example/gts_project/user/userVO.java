package com.example.gts_project.user;


/*
FileName: userVO
DB: user => PersonId, UserName, Password, UserType
 */
public class userVO {
    private int personId;
    private String userName;
    private String password;
    private int userType;
    private String phoneNum;

    public userVO(){};
    public userVO(String userName, String password, int userType, String phoneNum){
        this.userName = userName;
        this.password = password;
        this.userType = userType;
        this.phoneNum = phoneNum;
    }

    public int getPersonId() {
        return personId;
    }

    public void setPersonId(int personId) {
        this.personId = personId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getUserType() {
        return userType;
    }

    public void setUserType(int userType) {
        this.userType = userType;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
}