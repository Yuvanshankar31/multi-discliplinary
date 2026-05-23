import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobHistory from './pages/JobHistory';
import LandingPage from './pages/LandingPage';
import NewJob from './pages/NewJob';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Global ChartJS registration
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new-job" element={<ProtectedRoute><NewJob /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><JobHistory /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
