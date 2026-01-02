package com.example.gts_project.hospital;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class hospitalDAO {

    @Autowired
    private SqlSession sqlSession; // MyBatis 실행 객체 [cite: 426]

    public int insertHospital(hospitalVO vo) {
        return sqlSession.insert("hospitalDAO.insertHospital", vo);
    }

    public hospitalVO getHospital(int personId) {
        return sqlSession.selectOne("hospitalDAO.getHospital", personId);
    }
    public List<hospitalVO> getHospitalList() {
        return sqlSession.selectList("hospitalDAO.getHospitalList");
    }

}
