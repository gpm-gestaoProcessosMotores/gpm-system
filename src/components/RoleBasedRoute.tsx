import ProtectedRoute from './ProtectedRoute.tsx';

export default function RoleBasedRoute({ permissionKey }: { permissionKey: string }) {
  return <ProtectedRoute permissionKey={permissionKey} />;
}
