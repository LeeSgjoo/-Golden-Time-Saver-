import { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // axios 도입

// axios 기본 설정
axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api";

export default function HospitalDashboard() {
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);

  const navigate = useNavigate();

  // ====== DATA LOADING (실제 API 연동) ======
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. 로그인한 병원 본인의 정보 가져오기
      const hospRes = await axios.get(`${API_BASE}/hospital/me`);
      const hospData = hospRes.data;
      setHospital(hospData);

      // 2. 해당 병원 ID와 연관된 환자 리스트 가져오기
      const patientRes = await axios.get(`${API_BASE}/patients/hospital/${hospData.hospId}`);
      setPatients(patientRes.data);
    } catch (e) {
      setError("데이터를 불러오는 데 실패했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====== ACTIONS (상태 변경 API) ======

  // 환자 상태 업데이트 공통 함수
  const updatePatientStatus = async (pId, newStatus, hId) => {
    try {
      await axios.post(`${API_BASE}/patients/updateStatus`, {
        patientId: pId,
        calStatus: newStatus,
        calHospId: hId // 거절 시에는 null, 수락/완료 시에는 유지
      });
      alert("처리가 완료되었습니다.");
      closePatientModal();
      loadData(); // 데이터 새로고침
    } catch (e) {
      alert("상태 업데이트에 실패했습니다.");
    }
  };

  const acceptPatient = () => {
    if (!selectedPatientId) return;
    // 수용 중(1)으로 변경
    updatePatientStatus(selectedPatientId, 1, hospital.hospId);
  };

  const rejectPatient = () => {
    if (!selectedPatientId) return;
    // 다시 대기(0)로 보내고 병원 지정 해제(null)
    updatePatientStatus(selectedPatientId, 0, null);
  };

  const processPatient = () => {
    if (!selectedPatientId) return;
    // 처리 완료(2)로 변경
    updatePatientStatus(selectedPatientId, 2, hospital.hospId);
  };

  const logout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      await axios.post(`${API_BASE}/auth/logout`);
      navigate("/");
    }
  };

  // ====== UTIL & SELECTORS (기존 로직 유지) ======
  const safeText = (v) => (v === null || v === undefined || v === "" ? "--" : String(v));
  const safeNum = (v) => (typeof v === "number" && Number.isFinite(v) ? String(v) : "--");

  const statusBadge = (s) => {
    if (s === 0) return <span className="badge text-bg-warning">요청/이송중</span>;
    if (s === 1) return <span className="badge text-bg-success">수용중</span>;
    if (s === 2) return <span className="badge text-bg-dark">처리완료</span>;
    return <span className="badge text-bg-secondary">기타</span>;
  };

  const reqList = useMemo(() =>
          patients.filter((p) => p.calStatus === 0 && p.calHospId === hospital?.hospId),
      [hospital, patients]);

  const inList = useMemo(() =>
          patients.filter((p) => p.calStatus === 1 && p.calHospId === hospital?.hospId),
      [hospital, patients]);

  const selectedPatient = useMemo(() =>
          patients.find((p) => p.patientId === selectedPatientId) || null,
      [patients, selectedPatientId]);

  const openPatientModal = (patientId, context) => {
    setSelectedPatientId(patientId);
    setSelectedContext(context);
    setShowModal(true);
  };

  const closePatientModal = () => {
    setShowModal(false);
    setSelectedPatientId(null);
    setSelectedContext(null);
  };

  // (이하 return JSX 및 Sub-Components는 기존 UI 코드와 동일)
  return (
      <div className="bg-light min-vh-100">
        {/* ... (생략: 네비게이션 및 메인 렌더링 로직) ... */}
      </div>
  );
}