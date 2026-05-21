import { BadgeCheck, LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { initialUsers } from '../mocks/initialData.js';
import { getDefaultRoute } from '../utils/permissions.js';

const demoUsers = initialUsers;

export default function LoginPage() {
  const { user, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const authenticatedUser = await login(identifier, password);

    if (!authenticatedUser) {
      setError('Usuário, senha ou status inválido.');
      setLoading(false);
      return;
    }

    window.location.replace(getDefaultRoute(authenticatedUser.profile));
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-hero">
          <div className="brand">
            <img className="brand-logo" src="/gpm-logo.png" alt="Logo GPM" />
            <div>
              <strong>GPM</strong>
              <span>Gestão de Processos de Motores</span>
            </div>
          </div>
          <div className="login-logo-stage">
            <img className="login-logo-display" src="/gpm-logo.png" alt="GPM - Gestão de Processos de Motores" />
            <div className="login-hero-copy">
              <span>Workflow Industrial</span>
              <strong>Controle de OS para manutenção de motores</strong>
            </div>
            <div className="login-status-row" aria-label="Módulos do GPM">
              <span>OS</span>
              <span>QR Code</span>
              <span>Laudos</span>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-panel-heading">
            <p className="eyebrow">Acesso ao sistema</p>
            <h1>Entrar no GPM</h1>
            <p>Use seu e-mail ou login para acessar o painel.</p>
          </div>
          {user ? (
            <p className="login-session">
              Sessão atual: {user.name} ({user.profile}). Entrar abaixo troca a conta ativa.
            </p>
          ) : null}
          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="E-mail ou usuário"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error ? <p className="form-error">{error}</p> : null}
            <Button type="submit" size="lg" icon={LogIn} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="demo-users">
            <p>
              <BadgeCheck size={16} /> Acesso inicial
            </p>
            {demoUsers.map((demoUser) => (
              <button
                type="button"
                key={demoUser.id}
                onClick={() => {
                  setIdentifier(demoUser.email);
                  setPassword('123456');
                  setError('');
                }}
              >
                <strong>
                  <UserRound size={16} /> {demoUser.profile}
                </strong>
                <span>
                  <LockKeyhole size={14} /> {demoUser.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
