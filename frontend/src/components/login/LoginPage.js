import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1단계: axios 도입

// axios 기본 설정 (세션 쿠키 공유를 위해 필수)
axios.defaults.withCredentials = true;

export default function LoginPage() {
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState({ userId: "", password: "" });
  const [errorMsg, setErrorMsg] = useState(""); // 에러 메시지 상태 추가

  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => { // async 추가
    e.preventDefault();
    setValidated(true);

    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) return;

    try {
      // 2단계 & 3단계: 실제 백엔드 API 호출
      // 백엔드의 UserVO 필드명이 nickname이라면 아래와 같이 매핑
      const response = await axios.post("http://localhost:8080/api/auth/login_ok", {
        userName: form.userId,
        password: form.password
      });

      if (response.data.success) {
        // 백엔드에서 넘겨준 사용자 정보에 따라 페이지 이동
        const user = response.data.user;
        if (user.userType === 1) { // 역할 구분은 백엔드 VO 설계를 따름
          navigate("/hospital");
        } else if(user.userType === 0){
          navigate("/emerCenter");
        }else if(user.userType === 2){
          navigate("/emt")
        }
      }
    } catch (error) {
      // 4단계: 에러 처리
      if (error.response && error.response.status === 401) {
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
      } else {
        setErrorMsg("서버 연결에 실패했습니다. 관리자에게 문의하세요.");
      }
    }
  };

  return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
        <div className="w-100" style={{ maxWidth: 450 }}> {/* 가로폭 조정 */}
          <div className="text-center mb-3">
            {/* 로고 SVG 생략... */}
            <h1 className="fw-bold mb-1" style={{ color: "#2f5bff" }}>Golden Time Saver</h1>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-black mb-4" style={{ fontWeight: 900 }}>로그인</h2>

              {/* 에러 메시지 표시 구역 */}
              {errorMsg && <div className="alert alert-danger p-2 small">{errorMsg}</div>}

              <form noValidate className={validated ? "was-validated" : ""} onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="userId" className="form-label fw-semibold">ID</label>
                  <input
                      id="userId" name="userName" type="text"
                      className="form-control rounded-3"
                      value={form.userId} onChange={onChange}
                      required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">Password</label>
                  <input
                      id="password" name="password" type="password"
                      className="form-control rounded-3"
                      value={form.password} onChange={onChange}
                      required
                  />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                    style={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                >
                  로그인
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}