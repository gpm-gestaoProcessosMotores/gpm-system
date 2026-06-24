import { Edit3, Plus, Power, Save } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import CepInput from '../components/CepInput.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { sectors } from '../mocks/initialData.js';
import { cepService } from '../services/cepService.js';
import { employeeService } from '../services/employeeService.js';
import { userService } from '../services/userService.js';
import { formatCPF, formatPhone } from '../utils/validators.js';

const employeeTypes = [
  'Mecânico',
  'Técnico de Usinagem',
  'Técnico Eletricista',
  'Recepcionista',
  'Administrativo',
  'Gestor',
  'Administrador',
];

const profileByType = {
  Mecânico: 'Técnico',
  'Técnico de Usinagem': 'Técnico',
  'Técnico Eletricista': 'Técnico',
  Recepcionista: 'Administrativo',
  Administrativo: 'Administrativo',
  Gestor: 'Gestor',
  Administrador: 'Administrador',
};

const emptyEmployee = {
  name: '',
  cpf: '',
  rg: '',
  birthDate: '',
  phone: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  complement: '',
  role: '',
  sector: 'Mecânica',
  employeeType: 'Mecânico',
  admissionDate: '',
  status: 'Ativo',
  notes: '',
  createAccess: false,
  accessLogin: '',
  accessPassword: '',
  accessConfirmPassword: '',
  accessProfile: 'Técnico',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(employeeService.list());
  const [form, setForm] = useState(emptyEmployee);
  const [modalOpen, setModalOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  function openForm(employee = emptyEmployee) {
    setForm({
      ...emptyEmployee,
      ...employee,
      createAccess: false,
      accessLogin: employee.email || '',
      accessPassword: '',
      accessConfirmPassword: '',
      accessProfile: profileByType[employee.employeeType] || 'Técnico',
    });
    setCepError('');
    setModalOpen(true);
  }

  function refresh() {
    setEmployees(employeeService.list());
  }

  async function searchCep() {
    setCepLoading(true);
    setCepError('');
    try {
      const address = await cepService.getAddressByCep(form.cep);
      setForm((current) => ({ ...current, ...address }));
    } catch (error) {
      setCepError(error.message);
    } finally {
      setCepLoading(false);
    }
  }

  function saveEmployee(event) {
    event.preventDefault();
    if (form.createAccess && form.accessPassword !== form.accessConfirmPassword) {
      return;
    }

    const payload = { ...form };
    delete payload.createAccess;
    delete payload.accessLogin;
    delete payload.accessPassword;
    delete payload.accessConfirmPassword;
    delete payload.accessProfile;
    const savedEmployee = employeeService.save(payload);

    if (form.createAccess) {
      userService.createUser({
        name: form.name,
        email: form.email,
        login: form.accessLogin || form.email,
        password: form.accessPassword,
        profile: form.accessProfile,
        sector: form.sector,
        linkedEmployeeId: savedEmployee.id,
        linkedClientId: '',
        status: 'Ativo',
        lastAccess: '',
      });
    }

    refresh();
    setModalOpen(false);
  }

  function handleTypeChange(employeeType) {
    setForm({
      ...form,
      employeeType,
      accessProfile: profileByType[employeeType] || form.accessProfile,
      sector:
        employeeType === 'Mecânico'
          ? 'Mecânica'
          : employeeType === 'Técnico de Usinagem'
            ? 'Usinagem'
            : employeeType === 'Técnico Eletricista'
              ? 'Elétrica'
              : form.sector,
    });
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Somente administrador</p>
          <h2>Funcionários</h2>
        </div>
        <Button icon={Plus} onClick={() => openForm()}>
          Novo funcionário
        </Button>
      </div>

      <Card className="table-card">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Tipo</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Setor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td data-label="Nome">{employee.name}</td>
                <td data-label="CPF">{employee.cpf}</td>
                <td data-label="Tipo">{employee.employeeType || employee.role}</td>
                <td data-label="Telefone">{employee.phone}</td>
                <td data-label="E-mail">{employee.email}</td>
                <td data-label="Setor">{employee.sector}</td>
                <td data-label="Status">
                  <StatusBadge status={employee.status} />
                </td>
                <td data-label="Ações">
                  <div className="row-actions">
                    <Button variant="outline" icon={Edit3} onClick={() => openForm(employee)}>
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      icon={Power}
                      onClick={() => {
                        employeeService.toggleStatus(employee.id);
                        refresh();
                      }}
                    >
                      {employee.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal title={form.id ? 'Editar funcionário' : 'Cadastrar funcionário'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveEmployee}>
          <Input label="Nome completo" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="CPF" value={form.cpf} onChange={(event) => setForm({ ...form, cpf: formatCPF(event.target.value) })} required />
          <Input label="RG" value={form.rg} onChange={(event) => setForm({ ...form, rg: event.target.value })} />
          <Input
            label="Data de nascimento"
            type="date"
            value={form.birthDate}
            onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
          />
          <Input label="Telefone" value={form.phone} onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })} required />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value, accessLogin: form.accessLogin || event.target.value })}
            required
          />
          <CepInput value={form.cep} loading={cepLoading} error={cepError} onChange={(cep) => setForm({ ...form, cep })} onSearch={searchCep} />
          <Input label="Rua" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} />
          <Input label="Número" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
          <Input label="Bairro" value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} />
          <Input label="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          <Input label="Estado" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase().slice(0, 2) })} />
          <Input label="Complemento" value={form.complement} onChange={(event) => setForm({ ...form, complement: event.target.value })} />
          <Input label="Cargo" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required />
          <Select label="Setor" value={form.sector} options={sectors} onChange={(event) => setForm({ ...form, sector: event.target.value })} />
          <Select label="Tipo de funcionário" value={form.employeeType} options={employeeTypes} onChange={(event) => handleTypeChange(event.target.value)} />
          <Input
            label="Data de admissão"
            type="date"
            value={form.admissionDate}
            onChange={(event) => setForm({ ...form, admissionDate: event.target.value })}
          />
          <Select label="Status" value={form.status} options={['Ativo', 'Inativo']} onChange={(event) => setForm({ ...form, status: event.target.value })} />
          <label className="field span-2">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>

          <div className="client-access-box span-2">
            <label className="check-item">
              <input
                type="checkbox"
                checked={form.createAccess}
                onChange={(event) => setForm({ ...form, createAccess: event.target.checked })}
              />
              <span>Criar usuário para este funcionário?</span>
            </label>
            {form.createAccess ? (
              <div className="form-grid two">
                <Input label="Login/e-mail" value={form.accessLogin} onChange={(event) => setForm({ ...form, accessLogin: event.target.value })} />
                <Input
                  label="Senha inicial"
                  type="password"
                  value={form.accessPassword}
                  onChange={(event) => setForm({ ...form, accessPassword: event.target.value })}
                />
                <Input
                  label="Confirmar senha"
                  type="password"
                  value={form.accessConfirmPassword}
                  error={form.accessPassword !== form.accessConfirmPassword ? 'As senhas não conferem.' : ''}
                  onChange={(event) => setForm({ ...form, accessConfirmPassword: event.target.value })}
                />
                <Select
                  label="Perfil de acesso"
                  value={form.accessProfile}
                  options={['Administrador', 'Administrativo', 'Técnico', 'Gestor']}
                  onChange={(event) => setForm({ ...form, accessProfile: event.target.value })}
                />
              </div>
            ) : null}
          </div>

          <div className="form-actions span-2">
            <Button type="submit" icon={Save}>Salvar funcionário</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
