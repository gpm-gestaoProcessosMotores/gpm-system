import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess, getPermissionConfig } from '../utils/permissions.js';
import { navigationItems } from './Sidebar.tsx';

const preferredKeys = ['dashboard', 'ordens', 'tecnico', 'orcamentos', 'pesquisa'];

interface AuthUser {
  profile?: string;
}

interface AuthContextValue {
  user?: AuthUser | null;
}

export default function BottomNav() {
  const { user } = useAuth() as unknown as AuthContextValue;
  const [permissionVersion, setPermissionVersion] = useState(0);
  const permissionLabels = useMemo(() => {
    const config = getPermissionConfig();
    return config.items.reduce<Record<string, string>>((labels, item) => ({ ...labels, [item.key]: item.label }), {});
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
    <nav className="bottom-nav bg-card text-card-foreground" aria-label="Navegação rápida">
      {visibleItems.map((item) => (
        <NavLink key={item.key} to={item.path}>
          <item.icon size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
