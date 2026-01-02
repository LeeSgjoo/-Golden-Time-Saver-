package com.example.gts_project.patient;

import com.example.gts_project.user.userVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class patientServiceImpl implements patientService {

    @Autowired
    private patientDAO patientDAO;

    @Override
    public int insertPatient(patientVO vo) {
        System.out.println("PatientServiceImpl 실행: 환자 등록 로직 수행");
        return patientDAO.insertPatient(vo);
    }

    @Override
    public patientVO getPatient(int patientId) {
        return patientDAO.getPatient(patientId);
    }

    // --- 병원 계정 관련 로직 ---
    @Override
    public List<patientVO> getPatientListByPersonId_0(int personId) {
        return patientDAO.getPatientListByPersonId_0(personId);
    }

    @Override
    public List<patientVO> getPatientListByPersonId_1(int personId) {
        return patientDAO.getPatientListByPersonId_1(personId);
    }

    @Override
    public int updatePatientStatus_permit(int patientId) {
        return patientDAO.updatePatientStatus_permit(patientId);
    }

    @Override
    public int updatePatientStatus_reject(int patientId) {
        return patientDAO.updatePatientStatus_reject(patientId);
    }

    @Override
    public int updatePatientStatus_process(int patientId) {
        return patientDAO.updatePatientStatus_process(patientId);
    }

    // --- 중앙 관리 센터 관련 로직 ---
    @Override
    public List<patientVO> getPatientList_m1() {
        return patientDAO.getPatientList_m1();
    }

    @Override
    public int updatePatientStatus_call(int patientId, int personId) {
        System.out.println("PatientServiceImpl 실행: 환자 재요청 및 병원 할당 로직 수행");
        // 서비스 계층에서 DAO의 메서드를 호출합니다.
        // DAO 내부에서 Map 처리가 되어 있으므로 인자를 그대로 전달합니다.
        return patientDAO.updatePatientStatus_call(patientId, personId);
    }

    // --- 응급 구조사 관련 로직 ---
    @Override
    public List<patientVO> getPatientListByEMT_0(int personId) {
        return patientDAO.getPatientListByEMT_0(personId);
    }

    // --- 통계 관련 로직 ---
    @Override
    public int getTotalPatientCnt() {
        return patientDAO.getTotalPatientCnt();
    }

    @Override
    public int getPatientCnt_m1() {
        return patientDAO.getPatientCnt_m1();
    }

    @Override
    public int getPatientCnt_0() {
        return patientDAO.getPatientCnt_0();
    }

    @Override
    public int getPatientCnt_1() {
        return patientDAO.getPatientCnt_1();
    }
}