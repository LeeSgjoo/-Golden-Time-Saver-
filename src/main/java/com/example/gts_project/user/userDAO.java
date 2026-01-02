package com.example.gts_project.user;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class userDAO {

    @Autowired
    private SqlSession sqlSession; // MyBatis 실행 객체 [cite: 426]

    public int insertUser(userVO vo) {
        // namespace.id 형식으로 호출
        // 매퍼 파일(user-mapper.xml) 상단에 선언한 "namespace 값이 UserDAO인 것" // That is not this fileName
        // insertUser는 sql문 작성할 때 사용한 id 값
        return sqlSession.insert("userDAO.insertUser", vo);
    }
    public int deleteUser(int personId) {
        return sqlSession.delete("userDAO.deleteUser", personId);
    }
    public int updateUser(userVO vo) {
        return sqlSession.update("userDAO.updateUser", vo);
    }
    public userVO getUser(int personId) {
        return sqlSession.selectOne("userDAO.getUser", personId);
    }
    //public List<userVO> getUserByUserName(String userName) {return sqlSession.selectList("userDAO.getUserByUserName", userName);}
    public int getUserCnt(){
        return sqlSession.selectOne("userDAO.getUserCnt");
    }
    public List<userVO> getUserList() {
        return sqlSession.selectList("userDAO.getUserList");
    }
    public List<userVO> getUserListByUserType(int userType){
        return sqlSession.selectList("userDAO.getUserListByUserType", userType);
    }

}
