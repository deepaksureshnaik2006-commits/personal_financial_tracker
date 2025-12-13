import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    requireAuth: false
  },
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    requireAuth: true
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    requireAuth: true,
    requireAdmin: true
  }
];

export default routes;
