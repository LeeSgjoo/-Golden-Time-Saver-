import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/login/LoginPage';
import EmergencyCenterPage from './components/pages/EmergencyCenterPage';
import EmtPage from './components/pages/EmtPage';
import HospitalDashboard from './components/pages/HospitalPage';

// 로그인 여부에 따른 보호용 컴포넌트
const PrivateRoute = ({ children, allowedType }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <Navigate to="/" />;
  if (allowedType && user.userType !== allowedType) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            {/* 중앙센터: userType 0 가정 */}
            <Route path="/center" element={
              <PrivateRoute allowedType={0}><EmergencyCenterPage /></PrivateRoute>
            } />

            {/* 응급구조사: userType 2 가정 */}
            <Route path="/emt" element={
              <PrivateRoute allowedType={2}><EmtPage /></PrivateRoute>
            } />

            {/* 병원: userType 1 가정 */}
            <Route path="/hospital" element={
              <PrivateRoute allowedType={1}><HospitalDashboard /></PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;