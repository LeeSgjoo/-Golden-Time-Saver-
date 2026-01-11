import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

export default function EmtPage() {
  // 로그인된 EMT의 실제 ID (세션 등에서 가져오는 값으로 가정)
  const [emtId, setEmtId] = useState(3);

  const [patients, setPatients] = useState([]);
  const [view, setView] = useState("home");
  const [search, setSearch] = useState("");
  const [validated, setValidated] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  // patientVO 필드명에 맞춘 초기 상태
  const [form, setForm] = useState({
    KTAS: "3",
    symptoms: ""
  });

  const navigate = useNavigate();

  // ====== 1. 내 요청 환자 리스트 로드 (GET /patients/EMT_0) ======
  const fetchMyPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/patients/EMT_0`, {
        params: { personId: emtId }
      });
      setPatients(response.data);
    } catch (error) {
      console.error("환자 리스트 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchMyPatients();
  }, [emtId]);

  // ====== 2. 환자 등록 (POST /patient/insert) ======
  const onSubmitRegister = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      // 컨트롤러 파라미터 수집 방식에 맞춰 URLSearchParams 사용
      const params = new URLSearchParams();
      params.append('EMT_id', emtId);
      params.append('KTAS', Number(form.KTAS));
      params.append('symptoms', form.symptoms);
      params.append('cal_status', -1); // 등록 시 초기 상태: 요청 없음

      const response = await axios.post(`${API_BASE}/patient/insert`, params);

      if (response.data > 0) { // 성공 시 insert 카운트(1) 반환 가정
        alert("환자가 성공적으로 등록되었습니다.");
        fetchMyPatients();
        setForm({ KTAS: "3", symptoms: "" });
        setValidated(false);
        setView("list");
      }
    } catch (error) {
      alert("환자 등록 중 오류가 발생했습니다.");
    }
  };

  const onLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/");
    }
  };

  // ====== 3. 필터링 로직 (VO 필드명 반영) ======
  const myRequestedList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
        .filter((p) => p.cal_status === -1 || p.cal_status === 0)
        .filter((p) => {
          if (!q) return true;
          const hay = `${p.patientId} ${p.symptoms ?? ""}`.toLowerCase();
          return hay.includes(q);
        })
        .sort((a, b) => a.KTAS - b.KTAS);
  }, [patients, search]);

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
      <div className="bg-light min-vh-100">
        {/* Top Bar */}
        <nav className="navbar bg-white border-bottom">
          <div className="container py-1" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm" style={{ width: 44, height: 44, background: "#2f5bff" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h4l2-6 4 14 2-8h4" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="fw-black" style={{ fontWeight: 900, color: "#2f5bff", letterSpacing: "-0.02em" }}>Golden Time Saver</div>
                <div className="text-secondary small">응급구조사 대시보드</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border text-secondary">EMT #{emtId}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>로그아웃</button>
            </div>
          </div>
        </nav>

        <main className="container py-4" style={{ maxWidth: 980 }}>
          {/* HOME VIEW */}
          {view === "home" && (
              <section>
                <h1 className="fw-black mb-4" style={{ fontWeight: 900 }}>응급구조사 초기 페이지</h1>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100">
                      <div className="fw-bold mb-2">내 요청 환자 리스트</div>
                      <div className="fs-2 fw-bold text-primary mb-3">{myRequestedList.length}건</div>
                      <button className="btn btn-primary py-3 fw-bold" style={{ background: "#2f5bff" }} onClick={() => setView("list")}>리스트 보기</button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100">
                      <div className="fw-bold mb-2">신규 환자 등록</div>
                      <div className="text-secondary small mb-4">현장 환자 정보를 시스템에 등록</div>
                      <button className="btn btn-success py-3 fw-bold" onClick={() => setView("form")}>등록 폼 열기</button>
                    </div>
                  </div>
                </div>
              </section>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
              <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="fw-bold">요청 환자 리스트</h2>
                  <button className="btn btn-outline-secondary" onClick={() => setView("home")}>뒤로가기</button>
                </div>
                <div className="card border-0 shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="table-light">
                      <tr>
                        <th className="ps-3">ID</th>
                        <th>KTAS</th>
                        <th>증상</th>
                        <th>상태</th>
                        <th className="text-end pe-3">상세</th>
                      </tr>
                      </thead>
                      <tbody>
                      {myRequestedList.map((p) => (
                          <tr key={p.patientId}>
                            <td className="ps-3 fw-bold">#{p.patientId}</td>
                            <td>{ktasBadge(p.KTAS)}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>{p.symptoms}</td>
                            <td>{statusBadge(p.cal_status)}</td>
                            <td className="text-end pe-3">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openDetail(p)}>보기</button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
          )}

          {/* FORM VIEW */}
          {view === "form" && (
              <section>
                <h2 className="fw-bold mb-3">환자 등록</h2>
                <div className="card border-0 shadow-sm p-4">
                  <Form noValidate validated={validated} onSubmit={onSubmitRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">중증도 (KTAS)</Form.Label>
                      <Form.Select value={form.KTAS} onChange={(e) => setForm({...form, KTAS: e.target.value})}>
                        {[1,2,3,4,5].map(v => <option key={v} value={v}>Level {v}</option>)}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">증상 기록</Form.Label>
                      <Form.Control as="textarea" rows={4} required minLength={3} value={form.symptoms} onChange={(e) => setForm({...form, symptoms: e.target.value})} />
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button type="submit" className="px-5 fw-bold" style={{ background: "#2f5bff" }}>등록</Button>
                      <Button variant="outline-secondary" onClick={() => setView("home")}>취로</Button>
                    </div>
                  </Form>
                </div>
              </section>
          )}
        </main>

        {/* Detail Modal */}
        <Modal show={showDetail} onHide={closeDetail} centered size="lg">
          <Modal.Header closeButton><Modal.Title className="fw-bold">환자 상세 정보</Modal.Title></Modal.Header>
          <Modal.Body>
            {selected && (
                <div className="row g-3">
                  <div className="col-md-6"><div className="p-3 bg-light rounded border"><small>환자 ID</small><div className="fw-bold">#{selected.patientId}</div></div></div>
                  <div className="col-md-6"><div className="p-3 bg-light rounded border"><small>KTAS</small><div>{ktasBadge(selected.KTAS)}</div></div></div>
                  <div className="col-12"><div className="p-3 bg-light rounded border"><small>증상</small><p className="mb-0">{selected.symptoms}</p></div></div>
                  <div className="col-md-6"><div className="p-3 bg-light rounded border"><small>상태</small><div>{statusBadge(selected.cal_status)}</div></div></div>
                  <div className="col-md-6"><div className="p-3 bg-light rounded border"><small>배정 병원 ID</small><div>{selected.cal_hosp_id || "미정"}</div></div></div>
                </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
  );
}