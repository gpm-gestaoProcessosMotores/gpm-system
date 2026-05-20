import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileText,
  Gauge,
  History,
  KeyRound,
  LogOut,
  Cpu,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Truck,
  UserCog,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess } from '../utils/permissions.js';
import Button from './Button.jsx';

export const navigationItems = [
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
  { key: 'mecanica', label: 'Mecânica', path: '/mecanica', icon: Wrench },
  { key: 'usinagem', label: 'Usinagem', path: '/usinagem', icon: ClipboardCheck },
  { key: 'eletrica', label: 'Elétrica', path: '/eletrica', icon: ClipboardCheck },
  { key: 'fluxo', label: 'Fluxo Técnico', path: '/fluxo-tecnico', icon: ClipboardCheck },
  { key: 'laudos', label: 'Laudos', path: '/laudos', icon: FileText },
  { key: 'consolidacao', label: 'Consolidação', path: '/consolidacao', icon: ShieldCheck },
  { key: 'orcamentos', label: 'Orçamento', path: '/orcamentos', icon: FileClock },
  { key: 'pesquisa', label: 'Pesquisa', path: '/pesquisa', icon: Search },
  { key: 'relatorios', label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { key: 'historico', label: 'Histórico', path: '/historico', icon: History },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleItems = navigationItems.filter((item) => canAccess(user?.profile, item.key));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">GPM</div>
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
      </aside>
      <button className={`sidebar-overlay ${open ? 'is-open' : ''}`} aria-label="Fechar menu" onClick={onClose} />
    </>
  );
}
