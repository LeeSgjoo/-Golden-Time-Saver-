import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import axios from "axios"; // 1단계: axios 도입
import "bootstrap/dist/css/bootstrap.min.css";

// axios 기본 설정
axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api";

export default function EmtPage() {
  // 2단계: 로그인된 사용자 정보 (실제 프로젝트에서는 Context나 localStorage에서 가져옴)
  // 여기서는 테스트를 위해 세션에 저장된 정보를 기반으로 한다고 가정
  const [emtId, setEmtId] = useState(3);

  // ====== 4단계: MOCK 대신 서버 데이터 상태 관리 ======
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState("home");
  const [search, setSearch] = useState("");
  const [validated, setValidated] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ktas: "3", symptoms: "" });

  const navigate = useNavigate();

  // ====== 서버 데이터 로드 함수 ======
  const fetchMyPatients = async () => {
    try {
      // 내 ID로 등록된 환자 리스트 조회
      const response = await axios.get(`${API_BASE}/patients/emt/${emtId}`);
      setPatients(response.data);
    } catch (error) {
      console.error("환자 리스트 로드 실패:", error);
    }
  };

  // 페이지 진입 시 데이터 로드
  useEffect(() => {
    fetchMyPatients();
  }, [emtId]);

  // ====== 3단계: ACTIONS 수정 (실제 API 호출) ======
  const onSubmitRegister = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      // 백엔드 환자 등록 API 호출
      const response = await axios.post(`${API_BASE}/patients/register`, {
        emtId: emtId,
        ktas: Number(form.ktas),
        symptoms: form.symptoms,
        calStatus: 0 // 초기 요청 상태
      });

      if (response.status === 200 || response.status === 201) {
        alert("환자가 성공적으로 등록되었습니다.");
        fetchMyPatients(); // 리스트 갱신
        setForm({ ktas: "3", symptoms: "" });
        setValidated(false);
        setView("list");
      }
    } catch (error) {
      alert("환자 등록 중 오류가 발생했습니다.");
    }
  };

  const onLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await axios.post(`${API_BASE}/auth/logout`);
        navigate("/");
      } catch (error) {
        navigate("/"); // 에러나도 페이지 이동
      }
    }
  };

  // ====== FILTER: 내 환자 중 "요청상태=0"인 것만 리스트에 표시 ======
  const myRequestedList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
        .filter((p) => p.calStatus === 0) // 필터링은 서버 API에서 처리해오면 더 좋습니다.
        .filter((p) => {
          if (!q) return true;
          const hay = `${p.patientId} ${p.symptoms ?? ""} ${p.hospName ?? ""}`.toLowerCase();
          return hay.includes(q);
        })
        .sort((a, b) => Number(a.ktas) - Number(b.ktas));
  }, [patients, search]);

  // (이하 렌더링 로직 및 뱃지 함수는 기존과 동일)
  const safeText = (v) => (v === null || v === undefined || v === "" ? "--" : String(v));

  const statusBadge = (s) => {
    if (s === -1) return <Badge bg="secondary">요청없음</Badge>;
    if (s === 0) return <Badge bg="warning" text="dark">요청/이송중</Badge>;
    if (s === 1) return <Badge bg="success">병원이송</Badge>;
    if (s === 2) return <Badge bg="dark">처리완료</Badge>;
    return <Badge bg="light" text="dark" className="border">--</Badge>;
  };

  const ktasBadge = (k) => {
    const n = Number(k);
    if (n === 1) return <Badge bg="danger">KTAS 1</Badge>;
    if (n === 2) return <Badge bg="danger" className="bg-opacity-75">KTAS 2</Badge>;
    if (n === 3) return <Badge bg="warning" text="dark">KTAS 3</Badge>;
    if (n === 4) return <Badge bg="info" text="dark">KTAS 4</Badge>;
    return <Badge bg="secondary">KTAS 5</Badge>;
  };

  const openDetail = (p) => { setSelected(p); setShowDetail(true); };
  const closeDetail = () => { setShowDetail(false); setSelected(null); };

  return (
      // ... 기존 return JSX 코드 (navbar, home, list, form, modal) ...
      // 단, 로그아웃 버튼의 onClick={onLogout} 확인 필요
  );
}