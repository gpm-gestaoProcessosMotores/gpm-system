import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess, getDefaultRoute } from '../utils/permissions.js';

export default function ProtectedRoute({ permissionKey }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissionKey && !canAccess(user.profile, permissionKey)) {
    return <Navigate to={getDefaultRoute(user.profile)} replace />;
  }

  return <Outlet />;
}
