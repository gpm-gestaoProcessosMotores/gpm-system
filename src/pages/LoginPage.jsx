import { LockKeyhole, LogIn, UserRound } from 'lucide-react';
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
        <div className="login-panel">
          <p className="eyebrow">Acesso ao sistema</p>
          <h2>Entrar no GPM</h2>
          {user ? (
            <p className="muted">
              Sessão atual: {user.name} ({user.profile}). Entrar abaixo troca a conta ativa.
            </p>
          ) : null}
          <form className="form-grid" onSubmit={handleSubmit}>
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
        </div>

        <div className="login-hero">
          <div className="brand">
            <img className="brand-logo" src="/gpm-logo.png" alt="Logo GPM" />
            <div>
              <strong>Gestão de Processos de Motores</strong>
              <span>Manutenção industrial com consulta por OS</span>
            </div>
          </div>
          <div className="login-logo-stage">
            <img className="login-logo-display" src="/gpm-logo.png" alt="GPM - Gestão de Processos de Motores" />
            <p>Workflow técnico para a oficina e portal simples para clientes acompanharem motores.</p>
          </div>
          <div className="demo-users">
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
