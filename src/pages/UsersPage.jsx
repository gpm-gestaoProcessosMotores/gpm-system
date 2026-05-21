import { Plus } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import UserForm from '../components/UserForm.jsx';
import UserTable from '../components/UserTable.jsx';
import { profiles, sectors } from '../mocks/initialData.js';
import { clientService } from '../services/clientService.js';
import { employeeService } from '../services/employeeService.js';
import { userService } from '../services/userService.js';
import { technicalSectorByProfile } from '../utils/technicalStages.js';
import { isEmail } from '../utils/validators.js';

const emptyUser = {
  name: '',
  email: '',
  login: '',
  password: '',
  confirmPassword: '',
  profile: 'Administrativo',
  sector: 'Administrativo',
  linkedClientId: '',
  linkedEmployeeId: '',
  status: 'Ativo',
  lastAccess: '',
};

const technicianProfiles = ['Técnico Mecânica', 'Técnico Usinagem', 'Técnico Elétrica'];

function validateUser(form, editing = false, users = []) {
  const errors = {};
  const normalizedEmail = form.email.trim().toLowerCase();
  const normalizedLogin = form.login.trim().toLowerCase();

  if (!form.name.trim()) errors.name = 'Informe o nome completo.';
  if (!isEmail(form.email)) errors.email = 'Informe um e-mail válido.';
  if (!form.login.trim()) errors.login = 'Informe um login.';
  if (!form.profile) errors.profile = 'Selecione um perfil.';
  if (!form.status) errors.status = 'Selecione o status.';
  if (!editing && !form.password) errors.password = 'Senha obrigatória ao criar usuário.';
  if (!editing && form.password !== form.confirmPassword) errors.confirmPassword = 'A confirmação deve ser igual à senha.';
  if (form.profile === 'Cliente' && !form.linkedClientId) errors.linkedClientId = 'Vincule um cliente para perfil Cliente.';
  if (technicianProfiles.includes(form.profile) && !form.sector) errors.sector = 'Selecione o setor técnico.';

  const duplicatedEmail = users.some((user) => user.id !== form.id && user.email?.trim().toLowerCase() === normalizedEmail);
  const duplicatedLogin = users.some((user) => user.id !== form.id && user.login?.trim().toLowerCase() === normalizedLogin);
  if (normalizedEmail && duplicatedEmail) errors.email = 'Já existe um usuário com este e-mail.';
  if (normalizedLogin && duplicatedLogin) errors.login = 'Já existe um usuário com este login.';

  return errors;
}

export default function UsersPage() {
  const [users, setUsers] = useState(userService.getUsers());
  const clients = clientService.getClients();
  const employees = employeeService.list();
  const [form, setForm] = useState(emptyUser);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  function refresh() {
    setUsers(userService.getUsers());
  }

  function openForm(user = emptyUser) {
    setForm({
      ...emptyUser,
      ...user,
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function saveUser(event) {
    event.preventDefault();
    const editing = Boolean(form.id);
    const validationErrors = validateUser(form, editing, users);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      return;
    }

    const payload = {
      ...form,
      sector: technicalSectorByProfile[form.profile] || form.sector,
    };
    delete payload.confirmPassword;
    if (editing && !payload.password) {
      const currentUser = users.find((user) => user.id === payload.id);
      payload.password = currentUser.password;
    }

    userService.save(payload);
    refresh();
    setModalOpen(false);
  }

  function handleResetPassword(event) {
    event.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      return;
    }
    userService.resetPassword(resetUser.id, newPassword);
    setResetUser(null);
    setNewPassword('');
    setConfirmNewPassword('');
    refresh();
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h2>Usuários</h2>
        </div>
        <Button icon={Plus} onClick={() => openForm()}>
          Novo usuário
        </Button>
      </div>

      <UserTable
        users={users}
        clients={clients}
        employees={employees}
        onEdit={openForm}
        onResetPassword={(user) => setResetUser(user)}
        onToggleStatus={(id) => {
          userService.toggleStatus(id);
          refresh();
        }}
      />

      <Modal title={form.id ? 'Editar usuário' : 'Criar usuário'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={saveUser}>
          <UserForm
            form={form}
            setForm={setForm}
            profiles={profiles}
            sectors={sectors}
            clients={clients}
            employees={employees}
            editing={Boolean(form.id)}
            errors={errors}
          />
          <div className="form-actions">
            <Button type="submit">Salvar usuário</Button>
          </div>
        </form>
      </Modal>

      <Modal title={`Redefinir senha de ${resetUser?.name || ''}`} open={Boolean(resetUser)} onClose={() => setResetUser(null)}>
        <form className="form-grid" onSubmit={handleResetPassword}>
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmNewPassword}
            error={newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? 'As senhas não conferem.' : ''}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            required
          />
          <div className="form-actions">
            <Button type="submit" disabled={!newPassword || newPassword !== confirmNewPassword}>
              Redefinir senha
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
