import { Menu, Search, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './Button.jsx';

const titles = {
  '/dashboard': 'Dashboard Operacional',
  '/usuarios': 'Cadastro de Usuários',
  '/permissoes': 'Controle de Permissões',
  '/setores': 'Cadastro de Setores',
  '/funcionarios': 'Cadastro de Funcionários',
  '/clientes': 'Cadastro de Clientes',
  '/motores': 'Cadastro de Motores',
  '/ordens': 'Ordens de Serviço',
  '/ordens-servico': 'Ordens de Serviço',
  '/qrcode': 'QR Code da OS',
  '/leitor-qr': 'Leitura de QR Code',
  '/fluxo-tecnico': 'Fluxo Técnico da OS',
  '/mecanica': 'Área da Mecânica',
  '/usinagem': 'Área da Usinagem',
  '/eletrica': 'Área da Elétrica',
  '/laudos': 'Laudos Técnicos',
  '/consolidacao': 'Consolidação Técnica',
  '/orcamentos': 'Orçamento',
  '/pesquisa': 'Pesquisa de OS',
  '/relatorios': 'Relatórios Gerenciais',
  '/historico': 'Histórico de Alterações',
};

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = useMemo(() => {
    const match = Object.entries(titles).find(([path]) => location.pathname.startsWith(path));
    return match?.[1] || 'GPM';
  }, [location.pathname]);

  return (
    <header className="app-header">
      <Button variant="ghost" size="icon" icon={Menu} className="mobile-menu-button" onClick={onMenuClick}>
        Menu
      </Button>
      <div>
        <p className="eyebrow">Gestão de Processos de Motores</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <div className="desktop-search">
          <Search size={18} />
          <span>OS, cliente ou motor</span>
        </div>
        <div className="user-pill">
          <UserRound size={18} />
          <span>{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
