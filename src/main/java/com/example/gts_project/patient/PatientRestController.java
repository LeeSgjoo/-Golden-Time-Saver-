package com.example.gts_project.patient;

import com.example.gts_project.patient.patientServiceImpl;
import com.example.gts_project.patient.patientVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class PatientRestController {

    @Autowired
    private patientServiceImpl patientService; // 가칭

    // --- 병원 계정 관련 로직 ---
    // 1. 요청 상태에 따른 리스팅, personId는 접속 중인 병원계정의 유저아이디
    @GetMapping("/patients/PID_0")
    public List<patientVO> getPatientListByPersonId_0(int personId) {
        return patientService.getPatientListByPersonId_0(personId);
    }
    @GetMapping("/patients/PID_1")
    public List<patientVO> getPatientListByPersonId_1(int personId) {
        return patientService.getPatientListByPersonId_1(personId);
    }


    // 2. 요청처리 (허락, 거부, (퇴원등의 이유로)처리 등)
    @PostMapping("/patient/update/permit")
    public void patinetPermit(int patientId){
        patientService.updatePatientStatus_permit(patientId);
    }
    @PostMapping("/patient/update/reject")
    public void patinetReject(int patientId){
        patientService.updatePatientStatus_reject(patientId);
    }
    @PostMapping("/patient/update/process")
    public void patinetProcess(int patientId){
        patientService.updatePatientStatus_process(patientId);
    }


    // --- 중앙 관리 센터 관련 로직 ---
    @GetMapping("/patients/PID_m1")
    public List<patientVO> getPatientListByPersonId_m1() {
        return patientService.getPatientList_m1();
    }
    @PostMapping("/patient/update/call")
    public void patinetCall(int patientId, int personId){
        patientService.updatePatientStatus_call(patientId, personId);
    }

    // --- 응급 구조사 관련 로직 ---
    @GetMapping("/patients/EMT_0")
    public List<patientVO> getPatientListByEMT_0(int personId){
        return patientService.getPatientListByEMT_0(personId);
    }
    @GetMapping("/patients/cnt/total")
    public int getTotalPatientCnt() {return patientService.getTotalPatientCnt();}

    @GetMapping("/patients/cnt/m1")
    public int getPatientCnt_m1() {return patientService.getPatientCnt_0();}
    @GetMapping("/patients/cnt/1")
    public int getPatientCnt_1() {return patientService.getPatientCnt_1();}

}
