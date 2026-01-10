// src/components/pages/EmtPage.jsx
/*
컨트롤러 체크리스트
이 코드가 백엔드와 맞물려 돌아가려면 다음 컨트롤러 메서드들이 준비되어야 합니다.

PatientRestController:
GET /api/patients/emt/{emtId}: 해당 EMT가 등록한 환자 중 아직 완료되지 않은(calStatus < 2) 목록 반환.
POST /api/patients/register: @RequestBody PatientVO를 받아 DB에 insert.
CORS 설정: 모든 컨트롤러에 @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 적용.

JSON 바인딩: patientId, emtId, ktas, symptoms, calStatus 등의 필드명이 자바 VO와 리액트 JSON 키값 간에 대소문자까지 일치하는지 확인.
 */
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
    <div className="bg-light min-vh-100">
      {/* Top Bar */}
      <nav className="navbar bg-white border-bottom">
        <div className="container py-1" style={{ maxWidth: 980 }}>
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
              <div className="fw-black" style={{ fontWeight: 900, color: "#2f5bff", letterSpacing: "-0.02em" }}>
                Golden Time Saver
              </div>
              <div className="text-secondary small">응급구조사 대시보드</div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-light border text-secondary">
              EMT #{EMT_PERSON_ID}
            </span>
            <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4" style={{ maxWidth: 980 }}>
        {/* HOME */}
        {view === "home" && (
          <section>
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <h1 className="fw-black mb-2" style={{ fontWeight: 900 }}>
                  응급구조사 초기 페이지
                </h1>
                <div className="text-secondary">내가 요청한 환자(요청상태=0) 확인 및 환자 등록</div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-bold">내 요청 환자 리스트</div>
                        <div className="text-secondary small">EMT_id = 내 ID & 요청상태=0</div>
                      </div>
                      <span className="badge text-bg-primary">{myRequestedList.length}</span>
                    </div>

                    <div className="mt-3">
                      <button
                        className="btn text-white w-100 py-3 fw-bold rounded-3"
                        style={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                        onClick={() => setView("list")}
                      >
                        리스트 보기
                      </button>
                    </div>

                    <div className="text-secondary small mt-2">
                      * 요청상태=2가 되면 리스트에서 사라짐(백엔드 정책에 따라 반영)
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-bold">환자 등록</div>
                        <div className="text-secondary small">KTAS/증상 입력 후 등록</div>
                      </div>
                      <span className="badge text-bg-success">폼</span>
                    </div>

                    <div className="mt-3">
                      <button
                        className="btn btn-success w-100 py-3 fw-bold rounded-3"
                        onClick={() => setView("form")}
                      >
                        등록 폼 열기
                      </button>
                    </div>

                    <div className="text-secondary small mt-2">
                      등록 후 “내 요청 환자 리스트”로 이동
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LIST */}
        {view === "list" && (
          <section>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="fw-black mb-1" style={{ fontWeight: 900 }}>
                  내 요청 환자 리스트
                </h2>
                <div className="text-secondary">EMT_id = {EMT_PERSON_ID} & 요청상태=0</div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setView("home")}>
                  초기페이지
                </button>
                <button className="btn btn-primary" style={{ background: "#2f5bff", borderColor: "#2f5bff" }} onClick={() => setView("form")}>
                  환자 등록
                </button>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex gap-2 flex-column flex-md-row">
                  <input
                    className="form-control"
                    placeholder="검색: ID/증상/병원명"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="text-secondary small align-self-center">
                    {myRequestedList.length}명
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 90 }} className="ps-3">ID</th>
                      <th style={{ width: 110 }}>KTAS</th>
                      <th>증상</th>
                      <th style={{ width: 160 }}>요청 병원</th>
                      <th style={{ width: 130 }} className="text-end pe-3">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequestedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-secondary py-5">
                          요청상태=0인 내 환자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      myRequestedList.map((p) => (
                        <tr key={p.patientId}>
                          <td className="ps-3 fw-semibold">#{p.patientId}</td>
                          <td>{ktasBadge(p.ktas)}</td>
                          <td className="text-secondary">{safeText(p.symptoms)}</td>
                          <td className="text-secondary">{p.hospName ? p.hospName : "미지정"}</td>
                          <td className="text-end pe-3">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openDetail(p)}>
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
          </section>
        )}

        {/* FORM */}
        {view === "form" && (
          <section>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="fw-black mb-1" style={{ fontWeight: 900 }}>
                  환자 등록 폼
                </h2>
                <div className="text-secondary">KTAS / 증상 기록 입력</div>
              </div>
              <button className="btn btn-outline-secondary" onClick={() => setView("home")}>
                초기페이지
              </button>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <Form noValidate validated={validated} onSubmit={onSubmitRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">KTAS</Form.Label>
                    <Form.Select
                      value={form.ktas}
                      onChange={(e) => setForm((prev) => ({ ...prev, ktas: e.target.value }))}
                      required
                    >
                      <option value="1">1 (최우선)</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5 (경증)</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">KTAS를 선택하세요.</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">증상 기록</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="예) 흉통, 호흡곤란, 의식저하..."
                      value={form.symptoms}
                      onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                      required
                      minLength={3}
                    />
                    <Form.Control.Feedback type="invalid">
                      증상을 입력하세요 (3자 이상).
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      className="fw-bold px-4"
                      style={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                    >
                      등록
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setView("home")}>
                      취소
                    </Button>
                  </div>

                  <div className="text-secondary small mt-3">
                    * 백엔드 연결 시 등록 API 호출로 교체하면 됨.
                  </div>
                </Form>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={closeDetail} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            환자 상세 {selected ? `(ID: ${safeText(selected.patientId)})` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selected ? (
            <div className="text-secondary">선택된 환자가 없습니다.</div>
          ) : (
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">환자 ID</div>
                  <div className="fs-5 fw-bold">#{safeText(selected.patientId)}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">KTAS</div>
                  <div className="fs-5 fw-bold">{safeText(selected.ktas)}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">증상 기록</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{safeText(selected.symptoms)}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">등록 EMT ID</div>
                  <div className="fw-bold">{safeText(selected.emtId)}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">요청상태</div>
                  <div className="fw-bold">{statusBadge(selected.calStatus)}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-secondary small mb-1">요청 병원</div>
                  <div className="fw-bold">{selected.hospName ? `${selected.hospName} (${selected.calHospId})` : "미지정"}</div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeDetail}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
