package com.example.gts_project.hospital;

import com.example.gts_project.hospital.hospitalVO;
import java.util.List;

public interface hospitalService {

    public int saveHospital(hospitalVO vo);
    public hospitalVO getHospital(int hospitalId);

    public List<hospitalVO> getHospitalList();
}