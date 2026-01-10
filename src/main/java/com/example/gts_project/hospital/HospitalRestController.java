package com.example.gts_project.hospital;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class HospitalRestController {

    @Autowired
    private hospitalServiceImpl hospitalService; // 가칭

    // 1. 병원 리스트 조회 (HTML의 rendering 로직 대체)
    @GetMapping("/hospitals")
    public List<hospitalVO> getHospitalList() {
        return hospitalService.getHospitalList();
    }

    @GetMapping("/hospital")
    public hospitalVO getHospital(int hospitalId){
        return hospitalService.getHospital(hospitalId);
    }

/*
    // 2. 환자-병원 매칭 실행 (HTML의 executeMatch 로직 대체)
    @PostMapping("/match")
    public ResponseEntity<String> executeMatch(@RequestBody MatchRequest request) {
        // DB 상태 업데이트 로직 (status 변경 등)
        boolean success = hospitalService.updateMatchStatus(request);
        return success ? ResponseEntity.ok("Success") : ResponseEntity.badRequest().build();
    }

 */
}
