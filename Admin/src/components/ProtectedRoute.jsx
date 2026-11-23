import { Navigate } from 'react-router-dom';

// only logged in admins can see the admin pages
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('trendora_admin_token');
  const user = JSON.parse(localStorage.getItem('trendora_admin_user') || 'null');
  if (!token || !user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}
