import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess, getPermissionConfig } from '../utils/permissions.js';
import { navigationItems } from './Sidebar.jsx';

const preferredKeys = ['dashboard', 'ordens', 'mecanica', 'usinagem', 'eletrica'];

export default function BottomNav() {
  const { user } = useAuth();
  const [permissionVersion, setPermissionVersion] = useState(0);
  const permissionLabels = useMemo(() => {
    const config = getPermissionConfig();
    return config.items.reduce((labels, item) => ({ ...labels, [item.key]: item.label }), {});
  }, [permissionVersion]);
  const visibleItems = navigationItems
    .map((item) => ({ ...item, label: permissionLabels[item.key] || item.label }))
    .filter((item) => preferredKeys.includes(item.key) && canAccess(user?.profile, item.key))
    .slice(0, 5);

  useEffect(() => {
    const refreshPermissions = () => setPermissionVersion((version) => version + 1);
    window.addEventListener('gpm_permissions_updated', refreshPermissions);
    window.addEventListener('storage', refreshPermissions);
    return () => {
      window.removeEventListener('gpm_permissions_updated', refreshPermissions);
      window.removeEventListener('storage', refreshPermissions);
    };
  }, []);

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
