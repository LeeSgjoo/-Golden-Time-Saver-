// src/components/pages/EmtPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EmtPage() {
  // =========================
  // MOCK "로그인된 EMT" (나중에 백엔드 연동 시 교체)
  // =========================
  const EMT_PERSON_ID = 3;

  // =========================
  // MOCK DATA (나중에 fetch로 교체)
  // Cal_Status: -1(요청없음), 0(요청/이송중), 1(병원이송), 2(처리완료)
  // =========================
  const [patients, setPatients] = useState([
    { patientId: 101, emtId: 3, ktas: 2, symptoms: "흉통, 식은땀, 호흡곤란", calStatus: 0, calHospId: 2, hospName: "연세세브란스병원" },
    { patientId: 102, emtId: 3, ktas: 3, symptoms: "교통사고, 팔 통증, 출혈", calStatus: 0, calHospId: null, hospName: null },
    { patientId: 103, emtId: 3, ktas: 1, symptoms: "의식저하, 호흡 불규칙", calStatus: 1, calHospId: 1, hospName: "서울대학교병원" },
    { patientId: 104, emtId: 99, ktas: 4, symptoms: "복통, 구토", calStatus: 0, calHospId: null, hospName: null },
    { patientId: 105, emtId: 3, ktas: 4, symptoms: "어지러움, 구역감", calStatus: 2, calHospId: 5, hospName: "고려대학교병원" },
  ]);

  // =========================
  // UI STATE
  // =========================
  const [view, setView] = useState("home"); // home | list | form
  const [search, setSearch] = useState("");
  const [validated, setValidated] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    ktas: "3",
    symptoms: "",
  });

  const navigate = useNavigate();   

  // =========================
  // FILTER: "내가 요청한 환자" & "요청상태=0"
  // =========================
  const myRequestedList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
      .filter((p) => p.emtId === EMT_PERSON_ID && p.calStatus === 0)
      .filter((p) => {
        if (!q) return true;
        const hay = `${p.patientId} ${p.symptoms ?? ""} ${p.hospName ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => Number(a.ktas) - Number(b.ktas)); // KTAS 낮을수록 우선
  }, [patients, search]);

  // =========================
  // UTIL
  // =========================
  const safeText = (v) => (v === null || v === undefined || v === "" ? "--" : String(v));

  const statusBadge = (s) => {
    if (s === -1) return <Badge bg="secondary">요청없음</Badge>;
    if (s === 0) return <Badge bg="warning" text="dark">요청/이송중</Badge>;
    if (s === 1) return <Badge bg="success">병원이송</Badge>;
    if (s === 2) return <Badge bg="dark">처리완료</Badge>;
    return <Badge bg="light" text="dark" className="border">--</Badge>;
  };

  const ktasBadge = (k) => {
    // 색 지정 안 하랬던 건 차트였고, 배지는 UX 위해 최소로만.
    const n = Number(k);
    if (n === 1) return <Badge bg="danger">KTAS 1</Badge>;
    if (n === 2) return <Badge bg="danger" className="bg-opacity-75">KTAS 2</Badge>;
    if (n === 3) return <Badge bg="warning" text="dark">KTAS 3</Badge>;
    if (n === 4) return <Badge bg="info" text="dark">KTAS 4</Badge>;
    return <Badge bg="secondary">KTAS 5</Badge>;
  };

  // =========================
  // DETAIL MODAL
  // =========================
  const openDetail = (p) => {
    setSelected(p);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setSelected(null);
  };

  // =========================
  // REGISTER PATIENT (프론트 mock)
  // - 실제론 POST /patient 생성 + EMT_id = 로그인 user personId
  // - 생성 직후 calStatus=-1 (요청없음) 또는 0 (요청 시작) 정책은 백엔드와 맞추기
  // 여기서는 "요청상태=0"으로 바로 들어가게 해둠(리스트에 보여야 하니까)
  // =========================
  const onSubmitRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      setValidated(true);
      return;
    }
    setValidated(true);

    // TODO(백엔드): 여기만 구현하면 됨
    // const res = await fetch("/api/patient", { method:"POST", headers:{...}, body: JSON.stringify({...}) })
    // const created = await res.json()

    const newPatient = {
      patientId: Date.now(), // mock
      emtId: EMT_PERSON_ID,
      ktas: Number(form.ktas),
      symptoms: form.symptoms,
      calStatus: 0,          // EMT "요청한 환자 리스트"에 보이게
      calHospId: null,
      hospName: null,
    };

    setPatients((prev) => [newPatient, ...prev]);
    setForm({ ktas: "3", symptoms: "" });
    setValidated(false);
    setView("list");
  };

  
  // =========================
  // LOGOUT (원하면 navigate("/")로 변경)
  // =========================
  const onLogout = () => {
    alert("로그아웃");
    navigate("/");
  };

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
