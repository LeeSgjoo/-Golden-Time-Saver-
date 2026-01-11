import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

export default function EmtPage() {
  const [emtId, setEmtId] = useState(3); // 테스트용 ID
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ KTAS: "3", symptoms: "" });

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    try {
      // 수정된 부분: API 호출 방식 불일치 해결 (URLSearchParams 사용)
      const params = new URLSearchParams();
      params.append('EMT_id', emtId);
      params.append('KTAS', Number(form.KTAS));
      params.append('symptoms', form.symptoms);
      params.append('cal_status', -1); // 초기 등록 상태

      const response = await axios.post(`${API_BASE}/patient/insert`, params);

      if (response.data > 0) {
        alert("환자 등록 성공");
        // 리스트 갱신 로직 등
      }
    } catch (error) {
      alert("등록 실패");
    }
  };

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