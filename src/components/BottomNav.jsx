import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess } from '../utils/permissions.js';
import { navigationItems } from './Sidebar.jsx';

const preferredKeys = ['dashboard', 'ordens', 'mecanica', 'usinagem', 'eletrica'];

export default function BottomNav() {
  const { user } = useAuth();
  const visibleItems = navigationItems
    .filter((item) => preferredKeys.includes(item.key) && canAccess(user?.profile, item.key))
    .slice(0, 5);

  return (
    <nav className="bottom-nav" aria-label="Navegação rápida">
      {visibleItems.map((item) => (
        <NavLink key={item.key} to={item.path}>
          <item.icon size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
