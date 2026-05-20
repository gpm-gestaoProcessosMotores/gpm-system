import { LogOut } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './Button.jsx';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="client-shell">
      <header className="client-header">
        <div className="brand">
          <div className="brand-mark">GPM</div>
          <div>
            <strong>Portal do Cliente</strong>
            <span>{user?.name}</span>
          </div>
        </div>
        <Button variant="outline" icon={LogOut} onClick={handleLogout}>
          Sair
        </Button>
      </header>
      <main className="client-page">
        <Outlet />
      </main>
    </div>
  );
}
