import { Edit3, KeyRound, Power } from 'lucide-react';
import { formatDateTime } from '../utils/formatters.js';
import Button from './Button.jsx';
import Card from './Card.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function UserTable({ users, clients, employees, onEdit, onResetPassword, onToggleStatus }) {
  function getLinkedName(user) {
    if (user.profile === 'Cliente') {
      return clients.find((client) => client.id === user.linkedClientId)?.name || 'Cliente não vinculado';
    }

    return employees.find((employee) => employee.id === user.linkedEmployeeId)?.name || 'Funcionário não vinculado';
  }

  return (
    <Card className="table-card">
      <table className="responsive-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Login</th>
            <th>Perfil</th>
            <th>Vínculo</th>
            <th>Status</th>
            <th>Último acesso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td data-label="Nome">{user.name}</td>
              <td data-label="E-mail">{user.email}</td>
              <td data-label="Login">{user.login}</td>
              <td data-label="Perfil">{user.profile}</td>
              <td data-label="Vínculo">{getLinkedName(user)}</td>
              <td data-label="Status">
                <StatusBadge status={user.status} />
              </td>
              <td data-label="Último acesso">{formatDateTime(user.lastAccess)}</td>
              <td data-label="Ações">
                <div className="row-actions">
                  <Button variant="outline" icon={Edit3} onClick={() => onEdit(user)}>
                    Editar
                  </Button>
                  <Button variant="outline" icon={KeyRound} onClick={() => onResetPassword(user)}>
                    Redefinir senha
                  </Button>
                  <Button variant="outline" icon={Power} onClick={() => onToggleStatus(user.id)}>
                    {user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
