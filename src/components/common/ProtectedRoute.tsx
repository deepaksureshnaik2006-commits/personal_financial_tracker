import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const session = authService.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && session.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
