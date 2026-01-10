// src/components/pages/CenterPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import "./EmergencyCenterPage.css"

export default function EmergencyCenterPage() {
  // ====== MOCK DATA (나중에 백엔드 연동 시 여기만 교체) ======> 이거 테스트 용이니까 나중에 지우기!!!
  const [hospitals] = useState([
    { id: "H001", name: "서울대학교병원", location: "종로구", beds: 6, doctors: 3 },
    { id: "H002", name: "연세세브란스병원", location: "서대문구", beds: 3, doctors: 2 },
    { id: "H003", name: "삼성서울병원", location: "강남구", beds: 1, doctors: 1 },
    { id: "H004", name: "서울아산병원", location: "송파구", beds: 0, doctors: 0 },
    { id: "H005", name: "고려대학교병원", location: "성북구", beds: 4, doctors: 2 },
    { id: "H006", name: "가톨릭성모병원", location: "서초구", beds: 2, doctors: 1 },
  ]);

  const [waitingPatients, setWaitingPatients] = useState([
    { id: 1, info: "50대 남성, 흉통 호소, 의식 명료", requester: "김구급 (119-강남)", time: "3분 전", urgency: "high" },
    { id: 2, info: "30대 여성, 교통사고, 우측 다리 골절 의심", requester: "이응급 (119-서초)", time: "5분 전", urgency: "high" },
    { id: 3, info: "70대 남성, 호흡곤란, 고혈압/당뇨", requester: "박구조 (119-송파)", time: "8분 전", urgency: "normal" },
    { id: 4, info: "20대 남성, 급성 복통, 구토", requester: "최응급 (119-강동)", time: "12분 전", urgency: "normal" },
    { id: 5, info: "40대 여성, 어지러움, 구역감", requester: "정구급 (119-마포)", time: "15분 전", urgency: "normal" },
  ]);

  const [recentMatches, setRecentMatches] = useState([
    { patient: "60대 남성, 낙상...", hospital: "서울대학교병원", time: "10:32" },
    { patient: "45대 여성, 화상...", hospital: "연세세브란스병원", time: "10:15" },
    { patient: "35대 남성, 흉통...", hospital: "고려대학교병원", time: "09:48" },
  ]);

  // 통계(샘플값 유지)
  const [transporting, setTransporting] = useState(3);
  const [completed] = useState(7);

  // ====== UI STATE ======
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [hospitalIdInput, setHospitalIdInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ patient: "-", hospital: "-", time: "-" });

  // ====== DERIVED ======
  const totalPatients = useMemo(() => waitingPatients.length + transporting + completed, [waitingPatients.length, transporting, completed]);

  const filteredHospitals = useMemo(() => {
    const q = hospitalQuery.trim().toLowerCase();
    return hospitals.filter((h) => h.name.toLowerCase().includes(q));
  }, [hospitals, hospitalQuery]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    return waitingPatients.filter((p) => p.info.toLowerCase().includes(q) || p.requester.toLowerCase().includes(q));
  }, [waitingPatients, patientQuery]);

  const selectedPatient = useMemo(
    () => waitingPatients.find((p) => p.id === selectedPatientId) || null,
    [waitingPatients, selectedPatientId]
  );

  const selectedHospital = useMemo(() => {
    const id = hospitalIdInput.trim().toUpperCase();
    if (!id) return null;
    return hospitals.find((h) => h.id.toUpperCase() === id) || null;
  }, [hospitalIdInput, hospitals]);

  const hospitalHint = useMemo(() => {
    const raw = hospitalIdInput.trim();
    const id = raw.toUpperCase();
    if (!raw) return { text: "", cls: "" };
    if (selectedHospital) return { text: `✓ ${selectedHospital.name} (여석 ${selectedHospital.beds}석)`, cls: "valid" };
    return { text: "✗ 존재하지 않는 병원 ID입니다", cls: "invalid" };
  }, [hospitalIdInput, selectedHospital]);

  const canMatch = Boolean(selectedPatient && selectedHospital);

  const getHospitalStatus = (beds) => (beds >= 3 ? "available" : beds >= 1 ? "busy" : "full");

  const nowHHMM = () =>
    new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

   const navigate = useNavigate();

  // ====== ACTIONS ======
  const refreshData = () => {
    // TODO: 서버 연동 시 여기서 fetch
    alert("데이터를 새로고침합니다.");
  };

  const resetSelection = () => {
    setSelectedPatientId(null);
    setHospitalIdInput("");
  };

  const executeMatch = () => {
    if (!canMatch) return;

    const patientShort = `${selectedPatient.info.substring(0, 25)}...`;
    const time = nowHHMM();

    // 모달
    setModalInfo({
      patient: patientShort,
      hospital: selectedHospital.name,
      time,
    });
    setModalOpen(true);

    // 최근매칭 추가(최대 5)
    setRecentMatches((prev) => {
      const next = [
        { patient: `${selectedPatient.info.substring(0, 15)}...`, hospital: selectedHospital.name, time },
        ...prev,
      ];
      return next.slice(0, 5);
    });

    // 환자 대기 리스트에서 제거 + transporting 증가
    setWaitingPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
    setTransporting((v) => v + 1);

    // 초기화
    resetSelection();
  };

  const closeModal = () => setModalOpen(false);

  const logout = () => {
    if (window.confirm("로그아웃 하시겠습니까?-로그아웃 로직 128번째줄 근처")) {
      alert("로그아웃 되었습니다.");
      navigate("/");
    }
  };

  // ESC로 모달 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // 병원 클릭 -> ID 자동 입력
  const selectHospitalByClick = (id) => setHospitalIdInput(id);

  return (
    <div>
      {/* 헤더 */}
      <header className="header">
        <div className="header-left">
          <div className="logo-text">
            <div className="d-flex align-items-center gap-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm"
              style={{ width: 44, height: 44, background: "#2f5bff" }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h4l2-6 4 14 2-8h4"
                  stroke="#fff"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="fw-black" style={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#2f5bff" }}>
                Golden Time Saver
              </div>
              <div className="text-secondary small">병원 응급실 대시보드</div>
            </div>
          </div>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">중앙응급센터</span>
          <button className="btn-logout" onClick={logout}>로그아웃</button>
        </div>
      </header>

      {/* 메인 */}
      <main className="main-content">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <div>
            <h1 className="page-title">중앙센터 관리</h1>
            <p className="page-description">병원 현황 확인 및 환자-병원 매칭</p>
          </div>
          <div className="header-actions">
            <button className="btn-refresh" onClick={refreshData}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">전체 환자</div>
            <div className="stat-value">{totalPatients}<span className="stat-unit">명</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">대기 중</div>
            <div className="stat-value">{waitingPatients.length}<span className="stat-unit">명</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">이송 중</div>
            <div className="stat-value">{transporting}<span className="stat-unit">명</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">이송 완료</div>
            <div className="stat-value">{completed}<span className="stat-unit">명</span></div>
          </div>
        </div>

        {/* 3단 레이아웃 */}
        <div className="main-grid">
          {/* 병원 리스트 */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">병원 리스트</span>
              <span className="panel-count">{hospitals.length}</span>
            </div>

            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="병원명 검색..."
                value={hospitalQuery}
                onChange={(e) => setHospitalQuery(e.target.value)}
              />
              <div className="status-legend">
                <div className="legend-item">
                  <span className="legend-dot available" />
                  <span>수용가능</span>
                  <span className="legend-criteria">(3석 이상)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot busy" />
                  <span>혼잡</span>
                  <span className="legend-criteria">(1~2석)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot full" />
                  <span>만석</span>
                  <span className="legend-criteria">(0석)</span>
                </div>
              </div>
            </div>

            <div className="panel-body">
              {filteredHospitals.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>검색 결과가 없습니다</p>
                </div>
              ) : (
                filteredHospitals.map((h, index) => {
                  const status = getHospitalStatus(h.beds);
                  const selected = selectedHospital?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`hospital-item ${selected ? "selected" : ""}`}
                      onClick={() => selectHospitalByClick(h.id)}
                    >
                      <div className="hospital-top">
                        <span className="hospital-index">{index + 1}</span>
                        <span className="hospital-name">{h.name}</span>
                        <span className={`hospital-status-dot ${status}`} />
                      </div>
                      <div className="hospital-info">
                        <span>{h.location}</span>
                        <span>여석 {h.beds}석</span>
                        <span>대기 의사 {h.doctors}명</span>
                        <span>{h.id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 대기 환자 리스트 */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">대기 환자</span>
              <span className="panel-count">{waitingPatients.length}</span>
            </div>

            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="환자 정보 검색..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />
            </div>

            <div className="panel-body">
              {filteredPatients.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>대기 환자가 없습니다</p>
                </div>
              ) : (
                filteredPatients.map((p) => {
                  const selected = selectedPatientId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`patient-item ${selected ? "selected" : ""}`}
                      onClick={() => setSelectedPatientId(p.id)}
                    >
                      <div className="patient-top">
                        <span className="patient-id">#{p.id}</span>
                        <span className="patient-time">{p.time}</span>
                      </div>
                      <div className="patient-desc">
                        {p.info}
                        <span className={`urgency ${p.urgency}`}>
                          {p.urgency === "high" ? "긴급" : "보통"}
                        </span>
                      </div>
                      <div className="patient-meta">{p.requester}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 매칭 패널 */}
          <div className="matching-panel">
            <div className="matching-title">환자-병원 매칭</div>

            <div className={`match-slot ${selectedPatient ? "filled" : ""}`}>
              <div className="slot-label">선택된 환자</div>
              {selectedPatient ? (
                <div className="slot-value">#{selectedPatient.id} {selectedPatient.info.substring(0, 20)}...</div>
              ) : (
                <div className="slot-empty">환자를 선택하세요</div>
              )}
            </div>

            <div className="match-arrow">↓</div>

            <div className="match-form">
              <label className="slot-label">병원 ID 입력</label>
              <input
                type="text"
                className="hospital-id-input"
                placeholder="예: H001"
                value={hospitalIdInput}
                onChange={(e) => setHospitalIdInput(e.target.value)}
              />
              <div className={`hospital-id-hint ${hospitalHint.cls}`}>{hospitalHint.text}</div>
            </div>

            <button className="btn-match" onClick={executeMatch} disabled={!canMatch}>
              매칭 요청
            </button>
            <button className="btn-reset" onClick={resetSelection}>초기화</button>

            {/* 최근 매칭 */}
            <div className="recent-section">
              <div className="recent-title">최근 매칭 내역</div>
              <div>
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
        </div>
      </main>

      {/* 성공 모달 */}
      <div
        className={`modal-overlay ${modalOpen ? "active" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <div className="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="modal-title">매칭 완료</h2>
          <p className="modal-message">환자가 병원에 배정되었습니다.</p>
          <div className="modal-info">
            <div className="modal-row">
              <span className="modal-label">환자</span>
              <span className="modal-value">{modalInfo.patient}</span>
            </div>
            <div className="modal-row">
              <span className="modal-label">병원</span>
              <span className="modal-value">{modalInfo.hospital}</span>
            </div>
            <div className="modal-row">
              <span className="modal-label">시간</span>
              <span className="modal-value">{modalInfo.time}</span>
            </div>
          </div>
          <button className="btn-modal" onClick={closeModal}>확인</button>
        </div>
      </div>
    </div>
  );
}
