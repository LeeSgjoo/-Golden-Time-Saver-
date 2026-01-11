import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Modal, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8080/api/data";

export default function EmtPage() {
  const [view, setView] = useState("list"); // 'list' or 'register'
  const [myRequestedList, setMyRequestedList] = useState([]);
  const [form, setForm] = useState({ KTAS: "3", symptoms: "" });
  const [validated, setValidated] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const emtId = 3; // 실제 환경에선 세션에서 가져옴
  const navigate = useNavigate();

  const fetchMyList = async () => {
    try {
      // patientVO의 EMT_id 필드명에 맞춰 조회
      const res = await axios.get(`${API_BASE}/patients/PID_m1`);
      const myData = res.data.filter(p => p.EMT_id === emtId);
      setMyRequestedList(myData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchMyList(); }, []);

  const onLogout = () => { if(window.confirm("로그아웃?")) navigate("/"); };
  const openDetail = (p) => { setSelected(p); setShowDetail(true); };
  const closeDetail = () => { setShowDetail(false); setSelected(null); };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('EMT_id', emtId);
      params.append('KTAS', form.KTAS);
      params.append('symptoms', form.symptoms);
      params.append('cal_status', -1);

      await axios.post(`${API_BASE}/patient/insert`, params);
      alert("등록 성공");
      setForm({ KTAS: "3", symptoms: "" });
      setValidated(false);
      setView("list");
      fetchMyList();
    } catch (error) { alert("등록 실패"); }
  };

  const ktasBadge = (level) => <Badge bg="danger">Level {level}</Badge>;
  const statusBadge = (s) => {
    if (s === -1) return <Badge bg="secondary">대기중</Badge>;
    if (s === 0) return <Badge bg="warning">이송중</Badge>;
    return <Badge bg="success">수용완료</Badge>;
  };

  return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>응급구조사 대시보드</h2>
          <Button variant="outline-danger" onClick={onLogout}>로그아웃</Button>
        </div>

        {view === "list" ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <h4>내 요청 목록 ({myRequestedList.length}건)</h4>
                <Button onClick={() => setView("register")}>새 환자 등록</Button>
              </div>
              <Table striped bordered hover>
                <thead>
                <tr><th>ID</th><th>KTAS</th><th>상태</th><th>상세</th></tr>
                </thead>
                <tbody>
                {myRequestedList.map(p => (
                    <tr key={p.patientId}>
                      <td>{p.patientId}</td>
                      <td>{ktasBadge(p.KTAS)}</td>
                      <td>{statusBadge(p.cal_status)}</td>
                      <td><Button size="sm" onClick={() => openDetail(p)}>보기</Button></td>
                    </tr>
                ))}
                </tbody>
              </Table>
            </>
        ) : (
            <div className="card p-4">
              <h4>새 환자 등록</h4>
              <Form noValidate validated={validated} onSubmit={onSubmitRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>중증도 (KTAS)</Form.Label>
                  <Form.Select value={form.KTAS} onChange={e => setForm({...form, KTAS: e.target.value})}>
                    <option value="1">1단계 (즉각처치)</option>
                    <option value="2">2단계 (매우긴급)</option>
                    <option value="3">3단계 (긴급)</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>주요 증상</Form.Label>
                  <Form.Control required as="textarea" rows={3} value={form.symptoms}
                                onChange={e => setForm({...form, symptoms: e.target.value})} />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit">등록하기</Button>
                  <Button variant="secondary" onClick={() => setView("list")}>취소</Button>
                </div>
              </Form>
            </div>
        )}

        <Modal show={showDetail} onHide={closeDetail}>
          <Modal.Header closeButton><Modal.Title>환자 상세 정보</Modal.Title></Modal.Header>
          <Modal.Body>
            {selected && (
                <div>
                  <p><strong>환자 번호:</strong> {selected.patientId}</p>
                  <p><strong>중증도:</strong> {ktasBadge(selected.KTAS)}</p>
                  <p><strong>증상:</strong> {selected.symptoms}</p>
                  <p><strong>현재 상태:</strong> {statusBadge(selected.cal_status)}</p>
                  <p><strong>배정 병원 ID:</strong> {selected.cal_hosp_id || "미배정"}</p>
                </div>
            )}
          </Modal.Body>
          <Modal.Footer><Button onClick={closeDetail}>닫기</Button></Modal.Footer>
        </Modal>
      </div>
  );
}