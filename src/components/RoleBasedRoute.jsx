import ProtectedRoute from './ProtectedRoute.jsx';

export default function RoleBasedRoute({ permissionKey }) {
  return <ProtectedRoute permissionKey={permissionKey} />;
}
