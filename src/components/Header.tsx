import { Menu, Search, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { canAccess } from '../utils/permissions.js';
import Button from './Button.tsx';
import ThemeToggle from './ThemeToggle.tsx';

const titles: Record<string, string> = {
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
  '/tecnico': 'Área Técnica Integrada',
  '/fluxo-tecnico': 'Área Técnica Integrada',
  '/mecanica': 'Área Técnica Integrada',
  '/usinagem': 'Área Técnica Integrada',
  '/eletrica': 'Área Técnica Integrada',
  '/laudos': 'Laudos Técnicos',
  '/consolidacao': 'Consolidação Técnica',
  '/orcamentos': 'Orçamento',
  '/pesquisa': 'Pesquisa de OS',
  '/relatorios': 'Relatórios Gerenciais',
  '/historico': 'Histórico de Alterações',
};

interface AuthUser {
  name?: string;
  profile?: string;
}

interface AuthContextValue {
  user?: AuthUser | null;
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth() as unknown as AuthContextValue;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const title = useMemo(() => {
    const match = Object.entries(titles).find(([path]) => location.pathname.startsWith(path));
    return match?.[1] || 'GPM';
  }, [location.pathname]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      return;
    }

    navigate(`/pesquisa?busca=${encodeURIComponent(term)}`);
  }

  return (
    <header className="app-header bg-card text-card-foreground">
      <Button variant="ghost" size="icon" icon={Menu} className="mobile-menu-button" onClick={onMenuClick}>
        Menu
      </Button>
      <div>
        <p className="eyebrow">Gestão de Processos de Motores</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <ThemeToggle />
        {canAccess(user?.profile, 'pesquisa') ? (
          <form className="desktop-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="OS, cliente ou motor"
              aria-label="Pesquisar OS, cliente ou motor"
            />
            <button type="submit" aria-label="Pesquisar">
              Buscar
            </button>
          </form>
        ) : null}
        <div className="user-pill">
          <UserRound size={18} />
          <span>{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
