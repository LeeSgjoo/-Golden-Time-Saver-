import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

export default function EmergencyCenterPage() {
  const [hospitals, setHospitals] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [hospitalIdInput, setHospitalIdInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ patient: "-", hospital: "-", time: "-" });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [hospUsersRes, patientRes] = await Promise.all([
        axios.get(`${API_BASE}/users/userType?userType=1`),
        axios.get(`${API_BASE}/patients/PID_m1`)
      ]);
      setHospitals(hospUsersRes.data);
      setWaitingPatients(patientRes.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 필터링 및 유틸리티 함수 정의
  const filteredHospitals = useMemo(() =>
          hospitals.filter(h => h.userName.includes(hospitalQuery) || String(h.personId).includes(hospitalQuery))
      , [hospitals, hospitalQuery]);

  const filteredPatients = useMemo(() =>
          waitingPatients.filter(p => String(p.patientId).includes(patientQuery) || p.symptoms.includes(patientQuery))
      , [waitingPatients, patientQuery]);

  const selectedPatient = useMemo(() =>
          waitingPatients.find(p => p.patientId === selectedPatientId) || null
      , [waitingPatients, selectedPatientId]);

  const selectedHospital = useMemo(() =>
          hospitals.find(h => String(h.personId) === hospitalIdInput) || null
      , [hospitals, hospitalIdInput]);

  const logout = () => { if(window.confirm("로그아웃?")) navigate("/"); };
  const closeModal = () => setModalOpen(false);
  const resetSelection = () => { setSelectedPatientId(null); setHospitalIdInput(""); };
  const selectHospitalByClick = (id) => setHospitalIdInput(String(id));

  const canMatch = selectedPatientId && hospitalIdInput;
  const hospitalHint = selectedHospital ? selectedHospital.userName : "병원을 선택하세요";

  const executeMatch = async () => {
    if (!canMatch) return;
    try {
      const params = new URLSearchParams();
      params.append('patientId', selectedPatientId);
      params.append('personId', hospitalIdInput);

      await axios.post(`${API_BASE}/patient/update/call`, params);

      setModalInfo({
        patient: `환자 #${selectedPatientId}`,
        hospital: hospitalHint,
        time: new Date().toLocaleTimeString()
      });
      setModalOpen(true);
      fetchData();
      resetSelection();
    } catch (error) {
      alert("매칭 실패");
    }
  };

  return (
      <div className="container py-4">
        <div className="d-flex justify-content-between mb-4">
          <h3>중앙 제어 센터</h3>
          <button className="btn btn-outline-danger" onClick={logout}>로그아웃</button>
        </div>

        <div className="row">
          {/* 병원 목록 */}
          <div className="col-md-6">
            <input className="form-control mb-2" placeholder="병원 검색" onChange={e => setHospitalQuery(e.target.value)} />
            <ul className="list-group">
              {filteredHospitals.map(h => (
                  <li key={h.personId} className={`list-group-item ${hospitalIdInput === String(h.personId) ? 'active' : ''}`}
                      onClick={() => selectHospitalByClick(h.personId)}>
                    {h.userName} ({h.personId})
                  </li>
              ))}
            </ul>
          </div>

          {/* 환자 목록 */}
          <div className="col-md-6">
            <input className="form-control mb-2" placeholder="환자 검색" onChange={e => setPatientQuery(e.target.value)} />
            <ul className="list-group">
              {filteredPatients.map(p => (
                  <li key={p.patientId} className={`list-group-item ${selectedPatientId === p.patientId ? 'active' : ''}`}
                      onClick={() => setSelectedPatientId(p.patientId)}>
                    환자 #{p.patientId} - {p.symptoms}
                  </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-light border text-center">
          <h5>선택 정보: {selectedPatient ? `환자 #${selectedPatientId}` : "미선택"} → {hospitalHint}</h5>
          <button className="btn btn-primary mt-2" disabled={!canMatch} onClick={executeMatch}>매칭 실행</button>
          <button className="btn btn-secondary mt-2 ms-2" onClick={resetSelection}>초기화</button>
        </div>

        <Modal show={modalOpen} onHide={closeModal}>
          <Modal.Header closeButton><Modal.Title>매칭 완료</Modal.Title></Modal.Header>
          <Modal.Body>
            <p>{modalInfo.patient}가 {modalInfo.hospital}로 배정되었습니다.</p>
            <p>시간: {modalInfo.time}</p>
          </Modal.Body>
          <Modal.Footer><Button onClick={closeModal}>확인</Button></Modal.Footer>
        </Modal>
      </div>
  );
}