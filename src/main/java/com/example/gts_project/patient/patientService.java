package com.example.gts_project.patient;

import com.example.gts_project.user.userVO;
import java.util.List;

public interface patientService {

    // 1. 공통 및 등록 기능
    public int insertPatient(patientVO vo);
    public patientVO getPatient(int patientId);

    // 2. 병원 계정(UserType: 1) 관련 기능
    // 요청 대기 환자 목록 조회 (status: 0)
    public List<patientVO> getPatientListByPersonId_0(int personId);
    // 수락된 환자 목록 조회 (status: 1)
    public List<patientVO> getPatientListByPersonId_1(int personId);

    // 상태 변경: 수락(1), 거절(-1), 처리완료(2)
    public int updatePatientStatus_permit(int patientId);
    public int updatePatientStatus_reject(int patientId);
    public int updatePatientStatus_process(int patientId);

    // 3. 중앙 관리 센터 계정 관련 기능
    // 거절된 환자 목록 조회 (status: -1)
    public List<patientVO> getPatientList_m1();
    // 특정 병원으로 재요청 및 병원 ID 할당
    public int updatePatientStatus_call(int patientId, int personId);

    // 4. 응급 구조사 계정 관련 기능
    // 본인이 등록한 환자 중 대기 상태인 목록 조회
    public List<patientVO> getPatientListByEMT_0(int personId);

    // 5. 통계 및 기타 조회 기능
    public int getTotalPatientCnt();
    public int getPatientCnt_m1(); // 거절 환자 수
    public int getPatientCnt_0();  // 대기 환자 수
    public int getPatientCnt_1();  // 수락 환자 수

    public List<userVO> getUserList(); // 유저 목록 조회 (매퍼 기준)
}