
import { useState } from "react";

export default function LoginPage() {
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState({ userId: "", password: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const formEl = e.currentTarget;

    // Bootstrap validation 패턴: 브라우저 constraint validation 활용
    if (!formEl.checkValidity()) {
      setValidated(true);
      return;
    }

    setValidated(true);

   
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div className="w-100" style={{ maxWidth: 900 }}>
        {/* Brand */}
        <div className="text-center mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm mb-3"
            style={{ width: 72, height: 72, background: "#2f5bff" }}
            aria-hidden="true"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h4l2-6 4 14 2-8h4"
                stroke="#fff"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="fw-bold mb-1" style={{ color: "#2f5bff", letterSpacing: "-0.02em" }}>
            Golden Time Saver
          </h1>
          <div className="text-secondary">응급 의료 통합 관리 시스템</div>
        </div>

        {/* Card */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h2 className="fw-black mb-4" style={{ fontWeight: 900 }}>
              로그인
            </h2>

            <form
              noValidate
              className={validated ? "was-validated" : ""}
              onSubmit={onSubmit}
            >
              {/* 아이디 */}
              <div className="mb-3">
                <label htmlFor="userId" className="form-label fw-semibold ">
                  ID
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  className="form-control rounded-3"
                  placeholder="아이디를 입력하세요"
                  value={form.userId}
                  onChange={onChange}
                  required
                  minLength={2}
                />
                <div className="invalid-feedback">아이디를 입력하세요 (2자 이상).</div>
              </div>

              {/* 비밀번호 */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold">
                  password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control rounded-3"
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={onChange}
                  required
                  minLength={1}
                />
                <div className="invalid-feedback">비밀번호를 입력하세요 (1자 이상).</div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                style={{ background: "#2f5bff", borderColor: "#2f5bff" }}
                onClick={() => alert('src/components/login/LoginPage.js 111번째 줄 - 로그인 버튼 로직 여기에 있습니다. ')}
              >
                로그인
              </button>

            </form>
          </div>
        </div>

        {/* 아래 여백 */}
        <div className="text-center small text-secondary mt-3">
          © Golden Time Saver
        </div>
      </div>
    </div>
  );
}
