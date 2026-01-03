import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from './components/login/LoginPage';
import HospitalPage from './components/pages/HospitalPage';
import EmergencyCenterPage from './components/pages/EmergencyCenterPage';
import EmtPage from './components/pages/EmtPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/hospital" element={<HospitalPage />} />
          <Route path="/emerCenter" element={<EmergencyCenterPage />} />
          <Route path="/emt" element={<EmtPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
