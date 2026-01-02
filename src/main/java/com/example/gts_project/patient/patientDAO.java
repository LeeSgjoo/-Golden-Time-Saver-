package com.example.gts_project.patient;

import com.example.gts_project.user.userVO;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class patientDAO {

    @Autowired
    private SqlSession sqlSession; // MyBatis 실행 객체

    // 1. 환자 데이터 삽입
    public int insertPatient(patientVO vo) {
        return sqlSession.insert("patientDAO.insertPatient", vo);
    }

    // 2. 특정 환자 한 명 조회
    public patientVO getPatient(int patientId) {
        return sqlSession.selectOne("patientDAO.getPatient", patientId);
    }

    // 3. 병원 계정: 요청 대기 환자 리스트 (status 0)
    public List<patientVO> getPatientListByPersonId_0(int personId) {
        return sqlSession.selectList("patientDAO.getPatientListByPersonId_0", personId);
    }

    // 4. 병원 계정: 수락된 환자 리스트 (status 1)
    public List<patientVO> getPatientListByPersonId_1(int personId) {
        return sqlSession.selectList("patientDAO.getPatientListByPersonId_1", personId);
    }

    // 5. 환자 상태 업데이트: 수락 (status 1)
    public int updatePatientStatus_permit(int patientId) {
        return sqlSession.update("patientDAO.updatePatientStatus_permit", patientId);
    }

    // 6. 환자 상태 업데이트: 거절 (status -1)
    public int updatePatientStatus_reject(int patientId) {
        return sqlSession.update("patientDAO.updatePatientStatus_reject", patientId);
    }

    // 7. 환자 상태 업데이트: 처리 완료 (status 2 - 매퍼 로직에 맞춰 호출)
    public int updatePatientStatus_process(int patientId) {
        return sqlSession.update("patientDAO.updatePatientStatus_process", patientId);
    }

    // 8. 중앙 관리 센터: 거절된 / 아직 요청이 없는 환자 리스트 조회 (status -1)
    public List<patientVO> getPatientList_m1() {
        return sqlSession.selectList("patientDAO.getPatientList_m1");
    }

    // 9. 응급구조사: 환자 요청 (상태 0으로 변경 및 병원 ID 할당)
    public int updatePatientStatus_call(int patientId, int personId) {
        // 파라미터가 2개이므로 Map에 담아 전달합니다.
        Map<String, Object> params = new HashMap<>();
        params.put("patientId", patientId);
        params.put("personId", personId);
        return sqlSession.update("patientDAO.updatePatientStatus_call", params);
    }

    // 10. 통계: 전체 환자 수
    public int getTotalPatientCnt() {
        return sqlSession.selectOne("patientDAO.getTotalPatientCnt");
    }

    // 11. 통계: 상태별 환자 수 (거절/대기/수락)
    public int getPatientCnt_m1() { return sqlSession.selectOne("patientDAO.getPatientCnt_m1"); }
    public int getPatientCnt_0() { return sqlSession.selectOne("patientDAO.getPatientCnt_0"); }
    public int getPatientCnt_1() { return sqlSession.selectOne("patientDAO.getPatientCnt_1"); }

    // 12. 응급 구조사: 본인이 등록한 대기 환자 리스트
    public List<patientVO> getPatientListByEMT_0(int personId) {
        return sqlSession.selectList("patientDAO.getPatientListByEMT_0", personId);
    }
}