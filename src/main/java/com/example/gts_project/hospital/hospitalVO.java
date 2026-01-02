package com.example.gts_project.hospital;

public class hospitalVO {
    private int hospId;
    private String hospName;
    private String address;
    private String tel;
    private String opHrs;
    private String homePage; // homepage Link
    private int totalDoc;
    private int availabeDoc;
    private int totalBeds;
    private int availableBeds;
    private int userId;

    public hospitalVO(){};
    public hospitalVO(String hospName, String address, String tel, String opHrs, String homePage, int totalDoc, int availabeDoc, int totalBeds, int availableBeds, int userId) {
        this.hospName = hospName;
        this.address = address;
        this.tel = tel;
        this.opHrs = opHrs;
        this.homePage = homePage;
        this.totalDoc = totalDoc;
        this.availabeDoc = availabeDoc;
        this.totalBeds = totalBeds;
        this.availableBeds = availableBeds;
        this.userId = userId;
    }

    public int getHospId() {
        return hospId;
    }

    public void setHospId(int hospId) {
        this.hospId = hospId;
    }

    public String getHospName() {
        return hospName;
    }

    public void setHospName(String hospName) {
        this.hospName = hospName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getOpHrs() {
        return opHrs;
    }

    public void setOpHrs(String opHrs) {
        this.opHrs = opHrs;
    }

    public String getHomePage() {
        return homePage;
    }

    public void setHomePage(String homePage) {
        this.homePage = homePage;
    }

    public int getTotalDoc() {
        return totalDoc;
    }

    public void setTotalDoc(int totalDoc) {
        this.totalDoc = totalDoc;
    }

    public int getAvailabeDoc() {
        return availabeDoc;
    }

    public void setAvailabeDoc(int availabeDoc) {
        this.availabeDoc = availabeDoc;
    }

    public int getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(int totalBeds) {
        this.totalBeds = totalBeds;
    }

    public int getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(int availableBeds) {
        this.availableBeds = availableBeds;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}
