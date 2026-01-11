import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmergencyCenterPage.css";

axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

export default function EmergencyCenterPage() {
  // ====== 데이터 상태 관리 ======
  const [hospitals, setHospitals] = useState([]); // hospital 정보 기반
  const [waitingPatients, setWaitingPatients] = useState([]); // patientVO 기반
  const [recentMatches, setRecentMatches] = useState([]);

  // 통계 데이터
  const [totalPatients, setTotalPatients] = useState(0);
  const [transporting, setTransporting] = useState(0);
  const [completed, setCompleted] = useState(0);

  // ====== 1. 서버에서 데이터 가져오는 함수 ======
  const fetchData = async () => {
    try {
      // 병원 유저 목록, 대기 환자 목록, 통계 카운트를 동시에 호출
      const [hospUsersRes, patientRes, totalCnt, m1Cnt, p1Cnt] = await Promise.all([
        axios.get(`${API_BASE}/users/userType?userType=1`),
        axios.get(`${API_BASE}/patients/PID_m1`),
        axios.get(`${API_BASE}/patients/cnt/total`),
        axios.get(`${API_BASE}/patients/cnt/m1`),
        axios.get(`${API_BASE}/patients/cnt/1`)
      ]);

      // [주의] 현재 컨트롤러에는 hospitalVO 전체를 가져오는 API가 UserType 기반 리스트만 있으므로
      // userVO의 데이터를 UI에 맞게 매핑합니다. (추후 Hospital 전용 API 연결 권장)
      const mappedHospitals = hospUsersRes.data.map((user) => ({
        id: user.personId, // 매칭 시 전달할 ID
        name: user.userName,
        location: "지정된 주소 없음", // userVO에는 address가 없으므로 고정값 처리
        beds: 0, // hospitalVO와 연동 전이므로 기본값
        doctors: 0
      }));

      setHospitals(mappedHospitals);
      setWaitingPatients(patientRes.data);

      setTotalPatients(totalCnt.data);
      setTransporting(m1Cnt.data);
      setCompleted(p1Cnt.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ====== UI STATE ======
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [hospitalIdInput, setHospitalIdInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ patient: "-", hospital: "-", time: "-" });

  const navigate = useNavigate();

  // ====== 필터링 로직 (VO 필드명 반영) ======
  const filteredHospitals = useMemo(() => {
    const q = hospitalQuery.trim().toLowerCase();
    return hospitals.filter((h) => h.name.toLowerCase().includes(q));
  }, [hospitals, hospitalQuery]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    // patientVO의 symptoms 필드를 기준으로 검색
    return waitingPatients.filter((p) =>
        p.symptoms && p.symptoms.toLowerCase().includes(q)
    );
  }, [waitingPatients, patientQuery]);

  const selectedPatient = useMemo(
      () => waitingPatients.find((p) => p.patientId === selectedPatientId) || null,
      [waitingPatients, selectedPatientId]
  );

  const selectedHospital = useMemo(() => {
    const id = parseInt(hospitalIdInput.trim());
    return hospitals.find((h) => h.id === id) || null;
  }, [hospitalIdInput, hospitals]);

  const hospitalHint = useMemo(() => {
    if (!hospitalIdInput.trim()) return { text: "", cls: "" };
    if (selectedHospital) return { text: `✓ ${selectedHospital.name}`, cls: "valid" };
    return { text: "✗ 존재하지 않는 병원 ID입니다", cls: "invalid" };
  }, [hospitalIdInput, selectedHospital]);

  const canMatch = Boolean(selectedPatient && selectedHospital);

  const getHospitalStatus = (beds) => (beds >= 3 ? "available" : beds >= 1 ? "busy" : "full");
  const nowHHMM = () => new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  const resetSelection = () => { setSelectedPatientId(null); setHospitalIdInput(""); };

  // ====== 2. 매칭 실행 (PatientRestController 연동) ======
  const executeMatch = async () => {
    if (!canMatch) return;

    try {
      // 컨트롤러: public void patinetCall(int patientId, int personId)
      // Query Parameter 방식으로 전송
      const response = await axios.post(`${API_BASE}/patient/update/call`, null, {
        params: {
          patientId: selectedPatient.patientId,
          personId: selectedHospital.id
        }
      });

      if (response.status === 200) {
        const time = nowHHMM();
        setModalInfo({
          patient: `환자 #${selectedPatient.patientId} (KTAS ${selectedPatient.ktas})`,
          hospital: selectedHospital.name,
          time,
        });
        setModalOpen(true);

        // 최근 매칭 내역 업데이트
        setRecentMatches(prev => [{
          patient: `환자 #${selectedPatient.patientId}`,
          hospital: selectedHospital.name,
          time
        }, ...prev].slice(0, 5));

        fetchData(); // 상태 변경 후 목록 새로고침
        resetSelection();
      }
    } catch (error) {
      alert("매칭 요청에 실패했습니다.");
    }
  };

  const closeModal = () => setModalOpen(false);

  const logout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/");
    }
  };

  const selectHospitalByClick = (id) => setHospitalIdInput(id.toString());

  return (
      <div>
        {/* 헤더 */}
        <header className="header">
          <div className="header-left">
            <div className="logo-text">
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm" style={{ width: 44, height: 44, background: "#2f5bff" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h4l2-6 4 14 2-8h4" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="fw-black" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#2f5bff" }}>Golden Time Saver</div>
                  <div className="text-secondary small">중앙 관리 센터</div>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <span className="user-name">중앙응급센터 관리자</span>
            <button className="btn-logout" onClick={logout}>로그아웃</button>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">매칭 대시보드</h1>
              <p className="page-description">미배정 환자를 적정 병원에 신속하게 매칭합니다.</p>
            </div>
            <button className="btn-refresh" onClick={fetchData}>새로고침</button>
          </div>

          {/* 통계 섹션 */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">누적 환자</div>
              <div className="stat-value">{totalPatients}<span className="stat-unit">명</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">미배정 대기</div>
              <div className="stat-value">{waitingPatients.length}<span className="stat-unit">명</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">매칭 요청 중</div>
              <div className="stat-value">{transporting}<span className="stat-unit">건</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">수용 완료</div>
              <div className="stat-value">{completed}<span className="stat-unit">건</span></div>
            </div>
          </div>

          <div className="main-grid">
            {/* 1. 병원 리스트 */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">전국 응급의료기관</span>
                <span className="panel-count">{hospitals.length}</span>
              </div>
              <div className="search-box">
                <input type="text" className="search-input" placeholder="병원명 검색..." value={hospitalQuery} onChange={(e) => setHospitalQuery(e.target.value)} />
              </div>
              <div className="panel-body">
                {filteredHospitals.map((h, index) => (
                    <div key={h.id} className={`hospital-item ${selectedHospital?.id === h.id ? "selected" : ""}`} onClick={() => selectHospitalByClick(h.id)}>
                      <div className="hospital-top">
                        <span className="hospital-index">{index + 1}</span>
                        <span className="hospital-name">{h.name}</span>
                        <span className={`hospital-status-dot available`} />
                      </div>
                      <div className="hospital-info">
                        <span>ID: {h.id}</span>
                        <span>{h.location}</span>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* 2. 대기 환자 리스트 */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">미배정 환자 (PID_m1)</span>
                <span className="panel-count">{waitingPatients.length}</span>
              </div>
              <div className="search-box">
                <input type="text" className="search-input" placeholder="증상 검색..." value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} />
              </div>
              <div className="panel-body">
                {filteredPatients.map((p) => (
                    <div key={p.patientId} className={`patient-item ${selectedPatientId === p.patientId ? "selected" : ""}`} onClick={() => setSelectedPatientId(p.patientId)}>
                      <div className="patient-top">
                        <span className="patient-id">#ID {p.patientId}</span>
                        <span className={`urgency ${p.ktas <= 2 ? 'high' : 'normal'}`}>KTAS {p.ktas}</span>
                      </div>
                      <div className="patient-desc">{p.symptoms}</div>
                      <div className="patient-meta">등록 EMT: {p.emt_id}</div>
                    </div>
                ))}
              </div>
            </div>

            {/* 3. 매칭 패널 */}
            <div className="matching-panel">
              <div className="matching-title">실시간 매칭 요청</div>
              <div className={`match-slot ${selectedPatient ? "filled" : ""}`}>
                <div className="slot-label">선택된 환자</div>
                {selectedPatient ? <div>#{selectedPatient.patientId} (KTAS {selectedPatient.ktas})</div> : <div className="slot-empty">환자를 선택하세요</div>}
              </div>
              <div className="match-arrow">↓</div>
              <div className="match-form">
                <label className="slot-label">배정할 병원 ID</label>
                <input type="text" className="hospital-id-input" placeholder="병원 ID 직접 입력 가능" value={hospitalIdInput} onChange={(e) => setHospitalIdInput(e.target.value)} />
                <div className={`hospital-id-hint ${hospitalHint.cls}`}>{hospitalHint.text}</div>
              </div>
              <button className="btn-match" onClick={executeMatch} disabled={!canMatch}>매칭 전송</button>
              <button className="btn-reset" onClick={resetSelection}>초기화</button>

              <div className="recent-section">
                <div className="recent-title">최근 처리 내역</div>
                {recentMatches.map((m, idx) => (
                    <div key={idx} className="recent-item">
                      <div className="recent-patient">{m.patient}</div>
                      <div className="recent-hospital">→ {m.hospital}</div>
                      <div className="recent-time">{m.time}</div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* 성공 모달 */}
        <div className={`modal-overlay ${modalOpen ? "active" : ""}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg></div>
            <h2 className="modal-title">매칭 요청 완료</h2>
            <p className="modal-message">병원으로 환자 수용 요청이 전송되었습니다.</p>
            <div className="modal-info">
              <div className="modal-row"><span className="modal-label">대상</span><span className="modal-value">{modalInfo.patient}</span></div>
              <div className="modal-row"><span className="modal-label">병원</span><span className="modal-value">{modalInfo.hospital}</span></div>
              <div className="modal-row"><span className="modal-label">시간</span><span className="modal-value">{modalInfo.time}</span></div>
            </div>
            <button className="btn-modal" onClick={closeModal}>확인</button>
          </div>
        </div>
      </div>
  );
}