import { Edit3, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import CepInput from '../components/CepInput.jsx';
import ClientAccessForm from '../components/ClientAccessForm.jsx';
import CpfCnpjInput from '../components/CpfCnpjInput.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import Select from '../components/Select.jsx';
import { cepService } from '../services/cepService.js';
import { clientService } from '../services/clientService.js';
import { documentService } from '../services/documentService.js';
import { cnpjService } from '../services/cnpjService.js';
import { userService } from '../services/userService.js';
import { formatPhone, isEmail, onlyNumbers, validateCNPJ, validateCPF } from '../utils/validators.js';

const emptyClient = {
  type: 'Pessoa Física',
  name: '',
  document: '',
  rgStateRegistration: '',
  phone: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  complement: '',
  notes: '',
  allowLogin: false,
  accessStatus: 'Ativo',
  userId: '',
  accessLogin: '',
  accessPassword: '',
  accessConfirmPassword: '',
};

function hasAccess(client) {
  return userService.getUsers().some((user) => user.linkedClientId === client.id && user.profile === 'Cliente');
}

function validateClient(form, creatingAccess) {
  const errors = {};
  const digits = onlyNumbers(form.document);

  if (!form.type) errors.type = 'Selecione o tipo de cliente.';
  if (!form.name.trim()) errors.name = 'Informe o nome ou razão social.';
  if (!isEmail(form.email)) errors.email = 'Informe um e-mail válido.';
  if (digits.length === 11 && form.document !== '000.000.000-00' && form.document !== '111.111.111-11' && !validateCPF(form.document)) errors.document = 'CPF inválido.';
  if (digits.length === 14 && !validateCNPJ(form.document)) errors.document = 'CNPJ inválido.';
  if (![11, 14].includes(digits.length)) errors.document = 'Informe CPF ou CNPJ válido.';
  if (form.allowLogin) {
    if (!form.accessLogin.trim()) errors.accessLogin = 'Informe o e-mail/login do cliente.';
    if (creatingAccess && !form.accessPassword) errors.accessPassword = 'Informe a senha inicial.';
    if (form.accessPassword !== form.accessConfirmPassword) errors.accessConfirmPassword = 'As senhas não conferem.';
  }

  return errors;
}

export default function ClientsPage() {
  const [clients, setClients] = useState(clientService.getClients());
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  function refresh() {
    setClients(clientService.getClients());
  }

  function openForm(client = emptyClient) {
    const linkedUser = userService.getUsers().find((user) => user.linkedClientId === client.id);
    setForm({
      ...emptyClient,
      ...client,
      accessLogin: linkedUser?.login || linkedUser?.email || client.email || '',
      accessPassword: '',
      accessConfirmPassword: '',
    });
    setErrors({});
    setMessage('');
    setModalOpen(true);
  }

  async function searchCep() {
    setCepLoading(true);
    setMessage('');
    try {
      const address = await cepService.getAddressByCep(form.cep);
      setForm((current) => ({ ...current, ...address }));
    } catch (error) {
      setErrors((current) => ({ ...current, cep: error.message }));
    } finally {
      setCepLoading(false);
    }
  }

  function validateDocument() {
    const digits = onlyNumbers(form.document);
    const result = digits.length > 11 ? documentService.validateCNPJ(form.document) : documentService.validateCPF(form.document);
    setErrors((current) => ({ ...current, document: result.valid ? '' : result.message }));
    setMessage(result.message);
  }

  function handleDocumentChange(document) {
    const existingClient = documentService.searchClientByDocument(document);
    if (existingClient && existingClient.id !== form.id) {
      setForm({
        ...emptyClient,
        ...existingClient,
        accessLogin: existingClient.email || '',
        accessPassword: '',
        accessConfirmPassword: '',
      });
      setMessage('Cliente já cadastrado. Dados carregados automaticamente.');
      return;
    }

    setForm({ ...form, document, type: onlyNumbers(document).length > 11 ? 'Pessoa Jurídica' : 'Pessoa Física' });
  }

  async function searchCnpj() {
    setCnpjLoading(true);
    setMessage('');
    try {
      const data = await cnpjService.getCnpjData(form.document);
      setForm((current) => ({
        ...current,
        ...data,
        name: data.name || current.name,
        phone: data.phone || current.phone,
        email: data.email || current.email,
      }));
      setMessage('Dados do CNPJ preenchidos pela BrasilAPI.');
    } catch (error) {
      setErrors((current) => ({ ...current, document: error.message }));
    } finally {
      setCnpjLoading(false);
    }
  }

  function createClientAccess(client) {
    clientService.createClientAccess(client.id, {
      name: client.name,
      email: client.email,
      login: form.accessLogin || client.email,
      password: form.accessPassword,
      status: form.accessStatus,
    });
  }

  function saveClient(event) {
    event.preventDefault();
    const creatingAccess = form.allowLogin && (!form.id || !hasAccess(form));
    const validationErrors = validateClient(form, creatingAccess);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).some((key) => validationErrors[key])) {
      return;
    }

    const payload = { ...form };
    delete payload.accessLogin;
    delete payload.accessPassword;
    delete payload.accessConfirmPassword;
    const savedClient = clientService.save(payload);

    if (form.allowLogin && (form.accessPassword || creatingAccess)) {
      createClientAccess(savedClient);
    }

    refresh();
    setModalOpen(false);
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Comercial</p>
          <h2>Clientes</h2>
        </div>
        <Button icon={Plus} onClick={() => openForm()}>
          Novo cliente
        </Button>
      </div>

      <div className="grid-3">
        {clients.map((client) => (
          <Card className="stage-card" key={client.id}>
            <div className="stage-header">
              <div>
                <p className="eyebrow">{client.document}</p>
                <h3>{client.name}</h3>
              </div>
              <span className={`status ${hasAccess(client) ? 'status-success' : 'status-muted'}`}>
                {hasAccess(client) ? 'Com acesso' : 'Sem acesso'}
              </span>
            </div>
            <p className="muted">{client.address}</p>
            <div className="meta-grid">
              <span>{client.type}</span>
              <span>Telefone: {client.phone}</span>
              <span>{client.email}</span>
              <span>{client.city}/{client.state}</span>
            </div>
            <div className="row-actions">
              <Button variant="outline" icon={Edit3} onClick={() => openForm(client)}>
                Editar
              </Button>
              <Button
                variant="outline"
                icon={KeyRound}
                onClick={() => openForm({ ...client, allowLogin: true })}
              >
                Criar acesso
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  clientService.remove(client.id);
                  refresh();
                }}
              >
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal title={form.id ? 'Editar cliente' : 'Cadastrar cliente'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveClient}>
          <Select
            label="Tipo de cliente"
            value={form.type}
            options={['Pessoa Física', 'Pessoa Jurídica']}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          />
          <Input
            label="Nome completo ou razão social"
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <CpfCnpjInput
            value={form.document}
            error={errors.document}
            loading={cnpjLoading}
            onChange={handleDocumentChange}
            onValidate={validateDocument}
            onSearchCnpj={searchCnpj}
          />
          <Input
            label="RG ou inscrição estadual"
            value={form.rgStateRegistration}
            onChange={(event) => setForm({ ...form, rgStateRegistration: event.target.value })}
            required
          />
          <Input
            label="Telefone / número para contato"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: formatPhone(event.target.value) })}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm({ ...form, email: event.target.value, accessLogin: form.accessLogin || event.target.value })}
            required
          />
          <CepInput
            value={form.cep}
            loading={cepLoading}
            error={errors.cep}
            onChange={(cep) => setForm({ ...form, cep })}
            onSearch={searchCep}
          />
          <Input label="Rua" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} />
          <Input label="Número" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
          <Input label="Bairro" value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} />
          <Input label="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          <Input label="Estado" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase().slice(0, 2) })} />
          <Input label="Complemento" value={form.complement} onChange={(event) => setForm({ ...form, complement: event.target.value })} />
          <label className="field span-2">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>

          <ClientAccessForm form={form} setForm={setForm} errors={errors} />
          {message ? <p className="status status-cyan span-2">{message}</p> : null}

          <div className="form-actions span-2">
            <Button type="submit">Salvar cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
