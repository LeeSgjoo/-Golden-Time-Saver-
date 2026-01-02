package com.example.gts_project.hospital;

import com.example.gts_project.hospital.hospitalDAO;
import com.example.gts_project.hospital.hospitalService;
import com.example.gts_project.hospital.hospitalVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class hospitalServiceImpl implements hospitalService {

    @Autowired
    private hospitalDAO hospitalDAO;

    @Override
    public int saveHospital(hospitalVO vo){
        return hospitalDAO.insertHospital(vo);
    }
    @Override
    public hospitalVO getHospital(int hospitalId){
        return hospitalDAO.getHospital(hospitalId);
    }
    @Override
    public List<hospitalVO> getHospitalList(){
        return hospitalDAO.getHospitalList();
    }


}
