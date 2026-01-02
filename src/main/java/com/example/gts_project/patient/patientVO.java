package com.example.gts_project.patient;

public class patient {
    private int patientId;
    private int EMT_id;
    private int KTAS;
    private String symptoms;
    private int cal_status;
    private int cal_hosp_id;

    public patient(){};
    public patient(int EMT_id, int KTAS, String symptoms, int cal_status, int cal_hosp_id) {
        this.EMT_id = EMT_id;
        this.KTAS = KTAS;
        this.symptoms = symptoms;
        this.cal_status = cal_status;
        this.cal_hosp_id = cal_hosp_id;
    }

    public int getEMT_id() {
        return EMT_id;
    }

    public void setEMT_id(int EMT_id) {
        this.EMT_id = EMT_id;
    }

    public int getKTAS() {
        return KTAS;
    }

    public void setKTAS(int KTAS) {
        this.KTAS = KTAS;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public int getCal_status() {
        return cal_status;
    }

    public void setCal_status(int cal_status) {
        this.cal_status = cal_status;
    }

    public int getCal_hosp_id() {
        return cal_hosp_id;
    }

    public void setCal_hosp_id(int cal_hosp_id) {
        this.cal_hosp_id = cal_hosp_id;
    }
}
