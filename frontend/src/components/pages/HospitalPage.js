// HospitalDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function HospitalDashboard() {
  // ====== STATE ======
  const [view, setView] = useState("home"); // "home" | "requests" | "inhouse"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hospital, setHospital] = useState(null); // {hospId, hospName, totalSeat, availSeat, totalDoc, availDoc}
  const [patients, setPatients] = useState([]);   // [{patientId, emtId, name, ktas, symptoms, calStatus, calHospId}]

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null); // "requests" | "inhouse"

  const navigate = useNavigate();

  // ====== UTIL ======
  const safeText = (v) => (v === null || v === undefined || v === "" ? "--" : String(v));
  const safeNum = (v) => (typeof v === "number" && Number.isFinite(v) ? String(v) : "--");

  const statusBadge = (s) => {
    if (s === -1) return <span className="badge text-bg-secondary">요청없음</span>;
    if (s === 0) return <span className="badge text-bg-warning">요청/이송중</span>;
    if (s === 1) return <span className="badge text-bg-success">수용중</span>;
    if (s === 2) return <span className="badge text-bg-dark">처리완료</span>;
    return <span className="badge text-bg-light border">--</span>;
  };

  // ====== SELECTORS ======
  const reqList = useMemo(() => {
    if (!hospital) return [];
    return patients.filter((p) => p.calStatus === 0 && p.calHospId === hospital.hospId);
  }, [hospital, patients]);

  const inList = useMemo(() => {
    if (!hospital) return [];
    return patients.filter((p) => p.calStatus === 1 && p.calHospId === hospital.hospId);
  }, [hospital, patients]);

  const selectedPatient = useMemo(() => {
    if (selectedPatientId == null) return null;
    return patients.find((p) => p.patientId === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // ====== DATA LOADING ======
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 연동 시 여기를 교체하면 됨
        // const res = await fetch("/api/hospital/me");
        // if (!res.ok) throw new Error("hospital fetch failed");
        // const h = await res.json();
        // setHospital(h);
        //
        // const res2 = await fetch(`/api/patients?hospitalId=${h.hospId}`);
        // if (!res2.ok) throw new Error("patients fetch failed");
        // const ps = await res2.json();
        // setPatients(ps);

        // 지금은 미연동: 화면은 "--" 유지
        setHospital(null);
        setPatients([]);
      } catch (e) {
        setError(e?.message || "load failed");
        setHospital(null);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ====== MODAL ======
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

  // ====== ACTIONS (API 자리) ======
  const acceptPatient = () => alert("수락 로직(API) 자리");
  const rejectPatient = () => alert("거절 로직(API) 자리");
  const processPatient = () => alert("처리완료 로직(API) 자리");

  const logout = () => {
    alert("로그아웃 로직 102번째 줄입니다");
    navigate("/");// 로그인 페이지로 이동하는거
   
  };

  // ====== UI ======
  return (
    <div className="bg-light min-vh-100" style={{ fontFamily: `"Noto Sans KR", system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif` }}>
      {/* Top Bar */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container py-1">
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

          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-light border text-secondary">{safeText(hospital?.hospName)}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={logout}>로그아웃</button>
            
          </div>
        </div>
      </nav>

      <main className="container py-4" style={{ maxWidth: 980 }}>
        {/* HOME */}
        {view === "home" && (
          <section>
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <h1 className="mb-3" style={{ fontWeight: 900 }}>병원 초기 페이지</h1>
                <div className="text-secondary">현재 병원 자원 상태 / 요청 / 수용 환자 현황</div>
                {error && <div className="text-danger small mt-2">에러: {error}</div>}
                {loading && <div className="text-secondary small mt-2">로딩중...</div>}
              </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-3">
              <StatCard label="응급실 총 자리" value={safeNum(hospital?.totalSeat)} />
              <StatCard label="응급실 여석" value={safeNum(hospital?.availSeat)} />
              <StatCard label="의사 총원" value={safeNum(hospital?.totalDoc)} />
              <StatCard label="대기 의사" value={safeNum(hospital?.availDoc)} />
            </div>

            {/* Quick Actions */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <ActionCard
                  title="요청 대기 리스트"
                  desc="중앙센터가 보낸 요청(요청상태=0)"
                  badge={hospital ? reqList.length : "--"}
                  badgeClass="text-bg-primary"
                  buttonText="요청 리스트 보기"
                  buttonClass="btn text-white w-100 py-3 fw-bold rounded-3"
                  buttonStyle={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                  onClick={() => setView("requests")}
                  foot="수락/거절 처리 가능"
                />
              </div>

              <div className="col-12 col-md-6">
                <ActionCard
                  title="응급실 수용 환자"
                  desc="수락된 환자(요청상태=1)"
                  badge={hospital ? inList.length : "--"}
                  badgeClass="text-bg-success"
                  buttonText="수용 환자 보기"
                  buttonClass="btn btn-success w-100 py-3 fw-bold rounded-3"
                  onClick={() => setView("inhouse")}
                  foot="처리 완료 시 상태=2로 이동"
                />
              </div>
            </div>
          </section>
        )}

        {/* REQUESTS */}
        {view === "requests" && (
          <section>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="mb-1" style={{ fontWeight: 900 }}>요청 대기 리스트</h2>
                <div className="text-secondary">요청상태=0 & 요청병원ID = 내 병원ID</div>
              </div>
              <button className="btn btn-outline-secondary" onClick={() => setView("home")}>초기페이지</button>
            </div>

            <div className="card border-0" style={{ boxShadow: "0 10px 24px rgba(0,0,0,.06)" }}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3" style={{ width: 72 }}>#</th>
                        <th>환자</th>
                        <th style={{ width: 90 }}>KTAS</th>
                        <th>증상</th>
                        <th style={{ width: 140 }} className="text-end pe-3">상세</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hospital ? (
                        <tr>
                          <td colSpan="5" className="text-center text-secondary py-5">
                            병원 정보를 불러오지 못했습니다. (표시는 --)
                          </td>
                        </tr>
                      ) : reqList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-secondary py-5">
                            요청 대기 환자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        reqList.map((p, idx) => (
                          <tr key={p.patientId}>
                            <td className="ps-3 text-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>{idx + 1}</td>
                            <td className="fw-semibold">{safeText(p.name)}</td>
                            <td style={{ fontVariantNumeric: "tabular-nums" }}>
                              <span className="badge text-bg-light border">KTAS {safeText(p.ktas)}</span>
                            </td>
                            <td className="text-secondary">{safeText(p.symptoms)}</td>
                            <td className="text-end pe-3">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openPatientModal(p.patientId, "requests")}
                              >
                                보기
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INHOUSE */}
        {view === "inhouse" && (
          <section>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="mb-1" style={{ fontWeight: 900 }}>응급실 수용 환자 리스트</h2>
                <div className="text-secondary">요청상태=1 & 요청병원ID = 내 병원ID</div>
              </div>
              <button className="btn btn-outline-secondary" onClick={() => setView("home")}>초기페이지</button>
            </div>

            <div className="card border-0" style={{ boxShadow: "0 10px 24px rgba(0,0,0,.06)" }}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3" style={{ width: 72 }}>#</th>
                        <th>환자</th>
                        <th style={{ width: 90 }}>KTAS</th>
                        <th>증상</th>
                        <th style={{ width: 160 }} className="text-end pe-3">상세/처리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hospital ? (
                        <tr>
                          <td colSpan="5" className="text-center text-secondary py-5">
                            병원 정보를 불러오지 못했습니다.
                          </td>
                        </tr>
                      ) : inList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-secondary py-5">
                            현재 수용 중인 환자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        inList.map((p, idx) => (
                          <tr key={p.patientId}>
                            <td className="ps-3 text-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>{idx + 1}</td>
                            <td className="fw-semibold">{safeText(p.name)}</td>
                            <td style={{ fontVariantNumeric: "tabular-nums" }}>
                              <span className="badge text-bg-light border">KTAS {safeText(p.ktas)}</span>
                            </td>
                            <td className="text-secondary">{safeText(p.symptoms)}</td>
                            <td className="text-end pe-3">
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => openPatientModal(p.patientId, "inhouse")}
                              >
                                보기
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Patient Detail Modal */}
        <Modal show={showModal} onHide={closePatientModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">
              환자 상세 {selectedPatient ? `(ID: ${safeText(selectedPatient.patientId)})` : ""}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {!selectedPatient ? (
              <div className="text-secondary">환자 정보를 찾을 수 없습니다.</div>
            ) : (
              <div className="row g-3">
                <InfoBox title="환자명" value={<div className="fs-5 fw-bold">{safeText(selectedPatient.name)}</div>} />
                <InfoBox title="KTAS" value={<div className="fs-5 fw-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{safeText(selectedPatient.ktas)}</div>} col="col-12 col-md-3" />
                <InfoBox title="요청상태" value={<div className="fw-bold">{statusBadge(selectedPatient.calStatus)}</div>} col="col-12 col-md-3" />
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-secondary small mb-1">증상 기록</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{safeText(selectedPatient.symptoms)}</div>
                  </div>
                </div>
                <InfoBox title="EMT(등록 구조사) ID" value={<div className="fw-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{safeText(selectedPatient.emtId)}</div>} />
                <InfoBox title="요청 병원 ID" value={<div className="fw-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{safeText(selectedPatient.calHospId)}</div>} />
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={closePatientModal}>닫기</Button>

            <div className="d-flex gap-2">
              {selectedContext === "requests" && (
                <>
                  <Button variant="danger" onClick={rejectPatient}>거절</Button>
                  <Button variant="success" onClick={acceptPatient}>수락</Button>
                </>
              )}
              {selectedContext === "inhouse" && (
                <Button
                  style={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                  className="text-white"
                  onClick={processPatient}
                >
                  처리 완료
                </Button>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div className="card border-0" style={{ boxShadow: "0 10px 24px rgba(0,0,0,.06)" }}>
        <div className="card-body">
          <div className="text-secondary small mb-1">{label}</div>
          <div className="fs-3 fw-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, badge, badgeClass, buttonText, buttonClass, buttonStyle, onClick, foot }) {
  return (
    <div className="card border-0 h-100" style={{ boxShadow: "0 10px 24px rgba(0,0,0,.06)" }}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-bold">{title}</div>
            <div className="text-secondary small">{desc}</div>
          </div>
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>
        <div className="mt-3">
          <button className={buttonClass} style={buttonStyle} onClick={onClick}>
            {buttonText}
          </button>
        </div>
        <div className="text-secondary small mt-2">{foot}</div>
      </div>
    </div>
  );
}

function InfoBox({ title, value, col = "col-12 col-md-6" }) {
  return (
    <div className={col}>
      <div className="p-3 bg-light rounded-3 border">
        <div className="text-secondary small mb-1">{title}</div>
        {value}
      </div>
    </div>
  );
}
