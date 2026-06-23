import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  FileClock,
  FileText,
  Gauge,
  History,
  KeyRound,
  LogOut,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Truck,
  UserCog,
  UsersRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess, getPermissionConfig } from '../utils/permissions.js';
import Button from './Button.tsx';

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Gauge },
  { key: 'usuarios', label: 'Usuários', path: '/usuarios', icon: UserCog },
  { key: 'permissoes', label: 'Permissões', path: '/permissoes', icon: KeyRound },
  { key: 'setores', label: 'Setores', path: '/setores', icon: Cpu },
  { key: 'funcionarios', label: 'Funcionários', path: '/funcionarios', icon: UsersRound },
  { key: 'clientes', label: 'Clientes', path: '/clientes', icon: Truck },
  { key: 'motores', label: 'Motores', path: '/motores', icon: Wrench },
  { key: 'ordens', label: 'Ordens', path: '/ordens-servico', icon: ClipboardList },
  { key: 'qrcode', label: 'QR Code', path: '/qrcode', icon: QrCode },
  { key: 'leitor', label: 'Leitor QR', path: '/leitor-qr', icon: ScanLine },
  { key: 'tecnico', label: 'Técnico', path: '/tecnico', icon: ClipboardCheck },
  { key: 'laudos', label: 'Laudos', path: '/laudos', icon: FileText },
  { key: 'consolidacao', label: 'Consolidação', path: '/consolidacao', icon: ShieldCheck },
  { key: 'orcamentos', label: 'Orçamento', path: '/orcamentos', icon: FileClock },
  { key: 'pesquisa', label: 'Pesquisa', path: '/pesquisa', icon: Search },
  { key: 'relatorios', label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { key: 'historico', label: 'Histórico', path: '/historico', icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface AuthUser {
  profile?: string;
}

interface AuthContextValue {
  user?: AuthUser | null;
  logout: () => void | Promise<void>;
}

function useDesktopSidebar() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1120px)').matches : true,
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1120px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth() as unknown as AuthContextValue;
  const navigate = useNavigate();
  const isDesktop = useDesktopSidebar();
  const [permissionVersion, setPermissionVersion] = useState(0);
  const permissionLabels = useMemo(() => {
    const config = getPermissionConfig();
    return config.items.reduce<Record<string, string>>((labels, item) => ({ ...labels, [item.key]: item.label }), {});
  }, [permissionVersion]);
  const visibleItems = navigationItems
    .map((item) => ({ ...item, label: permissionLabels[item.key] || item.label }))
    .filter((item) => canAccess(user?.profile, item.key));

  useEffect(() => {
    const refreshPermissions = () => setPermissionVersion((version) => version + 1);
    window.addEventListener('gpm_permissions_updated', refreshPermissions);
    window.addEventListener('storage', refreshPermissions);
    return () => {
      window.removeEventListener('gpm_permissions_updated', refreshPermissions);
      window.removeEventListener('storage', refreshPermissions);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <motion.aside
        className={`sidebar ${open ? 'is-open' : ''}`}
        initial={false}
        animate={{ x: isDesktop || open ? 0 : '-104%' }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="brand">
          <img className="brand-logo" src="/gpm-logo.png" alt="Logo GPM" />
          <div>
            <strong>GPM</strong>
            <span>Workflow Industrial</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Menu principal">
          {visibleItems.map((item) => (
            <NavLink key={item.key} to={item.path} onClick={onClose}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>{user?.profile}</p>
          <Button variant="outline" icon={LogOut} onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {!isDesktop && open ? (
          <motion.button
            className="sidebar-overlay is-open"
            aria-label="Fechar menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
