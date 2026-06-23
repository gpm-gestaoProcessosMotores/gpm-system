import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess, getDefaultRoute } from '../utils/permissions.js';

interface AuthUser {
  profile: string;
}

interface AuthContextValue {
  user?: AuthUser | null;
}

export interface ProtectedRouteProps {
  permissionKey?: string;
}

export default function ProtectedRoute({ permissionKey }: ProtectedRouteProps) {
  const { user } = useAuth() as unknown as AuthContextValue;
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissionKey && !canAccess(user.profile, permissionKey)) {
    return <Navigate to={getDefaultRoute(user.profile)} replace />;
  }

  return <Outlet />;
}
