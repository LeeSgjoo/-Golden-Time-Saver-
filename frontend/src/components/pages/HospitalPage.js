import { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// axios 기본 설정
axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

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

  // ====== 1. DATA LOADING (실제 API 연동) ======
  const loadData = async () => {
    setLoading(true);
    try {
      // 병원 본인의 정보를 먼저 가져옴 (세션 기반 personId가 필요하나, 여기선 me API가 없으므로 유저 정보 활용 가정)
      // 실제 환경에서는 로그인 시 저장된 personId를 사용합니다.
      const hospInfoRes = await axios.get(`${API_BASE}/user/PID`, { params: { personId: 101 } }); // 예시 ID: 101
      const hospUser = hospInfoRes.data;

      // 해당 병원에 할당된 환자 리스트 (PID_0: 요청 대기, PID_1: 수용 중)
      const [reqRes, inRes] = await Promise.all([
        axios.get(`${API_BASE}/patients/PID_0`, { params: { personId: hospUser.personId } }),
        axios.get(`${API_BASE}/patients/PID_1`, { params: { personId: hospUser.personId } })
      ]);

      setHospital(hospUser); // hospitalVO와 필드가 매핑된다고 가정
      setPatients([...reqRes.data, ...inRes.data]);
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

  // ====== 2. ACTIONS (컨트롤러 엔드포인트 매핑) ======

  const acceptPatient = async () => {
    if (!selectedPatientId) return;
    try {
      // POST /api/data/patient/update/permit
      await axios.post(`${API_BASE}/patient/update/permit`, null, { params: { patientId: selectedPatientId } });
      alert("환자 수용을 승인했습니다.");
      closePatientModal();
      loadData();
    } catch (e) { alert("승인 처리에 실패했습니다."); }
  };

  const rejectPatient = async () => {
    if (!selectedPatientId) return;
    try {
      // POST /api/data/patient/update/reject
      await axios.post(`${API_BASE}/patient/update/reject`, null, { params: { patientId: selectedPatientId } });
      alert("요청을 거절했습니다.");
      closePatientModal();
      loadData();
    } catch (e) { alert("거절 처리에 실패했습니다."); }
  };

  const processPatient = async () => {
    if (!selectedPatientId) return;
    try {
      // POST /api/data/patient/update/process
      await axios.post(`${API_BASE}/patient/update/process`, null, { params: { patientId: selectedPatientId } });
      alert("진료 및 처리가 완료되었습니다.");
      closePatientModal();
      loadData();
    } catch (e) { alert("완료 처리에 실패했습니다."); }
  };

  const logout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/");
    }
  };

  // ====== 3. SELECTORS (VO 필드명 반영) ======
  const safeText = (v) => (v === null || v === undefined || v === "" ? "--" : String(v));

  const statusBadge = (s) => {
    if (s === 0) return <span className="badge text-bg-warning">요청/이송중</span>;
    if (s === 1) return <span className="badge text-bg-success">수용중</span>;
    if (s === 2) return <span className="badge text-bg-dark">처리완료</span>;
    return <span className="badge text-bg-secondary">기타</span>;
  };

  const reqList = useMemo(() =>
      patients.filter((p) => p.cal_status === 0), [patients]);

  const inList = useMemo(() =>
      patients.filter((p) => p.cal_status === 1), [patients]);

  const selectedPatient = useMemo(() =>
      patients.find((p) => p.patientId === selectedPatientId) || null, [patients, selectedPatientId]);

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

  return (
      <div className="bg-light min-vh-100">
        <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
          <div className="container py-1">
            <div className="d-flex align-items-center gap-3">
              <div className="d-inline-flex align-items-center justify-content-center rounded-4" style={{ width: 44, height: 44, background: "#2f5bff" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-6 4 14 2-8h4" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div className="fw-bold" style={{ color: "#2f5bff" }}>Golden Time Saver</div>
                <div className="text-secondary small">응급실 대시보드</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border text-secondary">{safeText(hospital?.userName)} 병원</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={logout}>로그아웃</button>
            </div>
          </div>
        </nav>

        <main className="container py-4" style={{ maxWidth: 980 }}>
          {view === "home" && (
              <section>
                <h1 className="mb-4 fw-bold">병원 관리 메인</h1>
                {/* hospitalVO의 필드명 반영 (totalBeds, availableBeds, totalDoc, availabeDoc) */}
                <div className="row g-3 mb-4">
                  <StatCard label="총 병상" value={hospital?.totalBeds || "--"} />
                  <StatCard label="가용 병상" value={hospital?.availableBeds || "--"} />
                  <StatCard label="의사 총원" value={hospital?.totalDoc || "--"} />
                  <StatCard label="대기 의사" value={hospital?.availabeDoc || "--"} />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <ActionCard title="수용 요청" desc="중앙센터 매칭 요청건" badge={reqList.length} badgeClass="bg-primary" buttonText="요청 목록" onClick={() => setView("requests")} />
                  </div>
                  <div className="col-md-6">
                    <ActionCard title="현재 수용" desc="진료 중인 환자건" badge={inList.length} badgeClass="bg-success" buttonText="환자 목록" onClick={() => setView("inhouse")} />
                  </div>
                </div>
              </section>
          )}

          {/* LIST VIEW (Requests/Inhouse) */}
          {(view === "requests" || view === "inhouse") && (
              <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="fw-bold">{view === "requests" ? "요청 대기" : "수용 환자"} 리스트</h2>
                  <button className="btn btn-outline-secondary" onClick={() => setView("home")}>뒤로가기</button>
                </div>
                <div className="card border-0 shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                      <tr>
                        <th className="ps-3">ID</th>
                        <th>KTAS</th>
                        <th>증상</th>
                        <th className="text-end pe-3">상세</th>
                      </tr>
                      </thead>
                      <tbody>
                      {(view === "requests" ? reqList : inList).map((p) => (
                          <tr key={p.patientId}>
                            <td className="ps-3 fw-bold">#{p.patientId}</td>
                            <td><span className="badge bg-danger">Level {p.KTAS}</span></td>
                            <td className="text-secondary">{p.symptoms}</td>
                            <td className="text-end pe-3">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openPatientModal(p.patientId, view)}>보기</button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
          )}

          {/* Patient Detail Modal */}
          <Modal show={showModal} onHide={closePatientModal} centered size="lg">
            <Modal.Header closeButton><Modal.Title className="fw-bold">환자 정보 상세</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedPatient && (
                  <div className="row g-3">
                    <InfoBox title="환자 ID" value={<div className="fw-bold">#{selectedPatient.patientId}</div>} col="col-6" />
                    <InfoBox title="중증도" value={<div className="fw-bold text-danger">KTAS {selectedPatient.KTAS}</div>} col="col-6" />
                    <div className="col-12"><div className="p-3 bg-light rounded border"><small>증상 기록</small><p className="mb-0 mt-1">{selectedPatient.symptoms}</p></div></div>
                    <InfoBox title="담당 EMT ID" value={selectedPatient.EMT_id} col="col-6" />
                    <InfoBox title="현재 상태" value={statusBadge(selectedPatient.cal_status)} col="col-6" />
                  </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closePatientModal}>닫기</Button>
              <div className="ms-auto d-flex gap-2">
                {selectedContext === "requests" && (
                    <>
                      <button className="btn btn-danger px-4" onClick={rejectPatient}>거절</button>
                      <button className="btn btn-success px-4" onClick={acceptPatient}>수락</button>
                    </>
                )}
                {selectedContext === "inhouse" && (
                    <button className="btn btn-primary px-4" onClick={processPatient}>처리 완료</button>
                )}
              </div>
            </Modal.Footer>
          </Modal>
        </main>
      </div>
  );
}

// 서브 컴포넌트 (StatCard, ActionCard, InfoBox)는 기존 UI 스타일을 유지하여 그대로 사용 가능합니다.
function StatCard({ label, value }) {
  return (
      <div className="col-md-3">
        <div className="card border-0 shadow-sm p-3">
          <div className="text-secondary small mb-1">{label}</div>
          <div className="fs-3 fw-bold">{value}</div>
        </div>
      </div>
  );
}

function ActionCard({ title, desc, badge, badgeClass, buttonText, onClick }) {
  return (
      <div className="card border-0 shadow-sm p-4 h-100">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div><div className="fw-bold fs-5">{title}</div><div className="text-secondary small">{desc}</div></div>
          <span className={`badge ${badgeClass} fs-6`}>{badge}</span>
        </div>
        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={onClick}>{buttonText}</button>
      </div>
  );
}

function InfoBox({ title, value, col = "col-12" }) {
  return (
      <div className={col}>
        <div className="p-3 bg-light rounded border">
          <div className="text-secondary small mb-1">{title}</div>
          <div className="fw-bold">{value}</div>
        </div>
      </div>
  );
}