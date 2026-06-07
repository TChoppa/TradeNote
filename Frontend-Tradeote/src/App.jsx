import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CalendarPage from './pages/CalendarPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"          element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/"  element={<Navigate to="/login"    replace />} />
      <Route path="*"  element={<Navigate to="/login"    replace />} />
    </Routes>
  );
};

export default App;