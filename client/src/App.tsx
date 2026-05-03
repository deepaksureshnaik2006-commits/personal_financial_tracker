import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import Header from '@/components/common/Header';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import { authService } from '@/services/authService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const handlePopState = () => {
      if (!authService.isAuthenticated() && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Header />}
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
