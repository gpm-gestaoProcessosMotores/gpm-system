import { Eye, Plus, QrCode } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import OSCard from '../components/OSCard.jsx';
import CpfCnpjInput from '../components/CpfCnpjInput.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { clientService } from '../services/clientService.js';
import { cnpjService } from '../services/cnpjService.js';
import { documentService } from '../services/documentService.js';
import { motorService } from '../services/motorService.js';
import { osService } from '../services/osService.js';
import { canAccess } from '../utils/permissions.js';

const emptyOrder = {
  clientId: '',
  motorId: '',
  expectedAt: '',
  priority: 'Média',
  summary: '',
  clientDocument: '',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const clients = clientService.list();
  const motors = motorService.list();
  const [orders, setOrders] = useState(osService.getVisibleOrdersForUser(user));
  const [modalOpen, setModalOpen] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [form, setForm] = useState({
    ...emptyOrder,
    clientId: clients[0]?.id || '',
    motorId: motors.find((motor) => motor.clientId === clients[0]?.id)?.id || motors[0]?.id || '',
  });

  const availableMotors = useMemo(
    () => motors.filter((motor) => !form.clientId || motor.clientId === form.clientId),
    [form.clientId, motors],
  );

  function openForm() {
    const firstClientId = clients[0]?.id || '';
    const firstMotorId = motors.find((motor) => motor.clientId === firstClientId)?.id || '';
    setForm({ ...emptyOrder, clientId: firstClientId, motorId: firstMotorId });
    setLookupMessage('');
    setModalOpen(true);
  }

  function saveOrder(event) {
    event.preventDefault();
    if (!form.clientId || !form.motorId) {
      setLookupMessage('Selecione um cliente e um motor antes de gerar a OS.');
      return;
    }
    osService.save(form, user?.name);
    setOrders(osService.getVisibleOrdersForUser(user));
    setModalOpen(false);
  }

  function handleClientChange(clientId) {
    const firstMotor = motors.find((motor) => motor.clientId === clientId);
    setForm({ ...form, clientId, motorId: firstMotor?.id || '' });
  }

  function handleDocumentLookup(document) {
    setForm({ ...form, clientDocument: document });
    const client = documentService.searchClientByDocument(document);
    if (!client) {
      setLookupMessage('Cliente não encontrado. Cadastre o cliente completo antes de criar a OS.');
      return;
    }

    const firstMotor = motors.find((motor) => motor.clientId === client.id);
    setForm({ ...form, clientDocument: document, clientId: client.id, motorId: firstMotor?.id || '' });
    setLookupMessage(`Cliente localizado: ${client.name}`);
  }

  async function handleCnpjLookup() {
    const client = documentService.searchClientByDocument(form.clientDocument);
    if (client) {
      handleDocumentLookup(form.clientDocument);
      return;
    }

    setCnpjLoading(true);
    try {
      const data = await cnpjService.getCnpjData(form.clientDocument);
      setLookupMessage(`${data.name || 'CNPJ localizado'} encontrado na BrasilAPI. Cadastre o cliente completo antes de gerar a OS.`);
    } catch (error) {
      setLookupMessage(error.message);
    } finally {
      setCnpjLoading(false);
    }
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Workflow</p>
          <h2>Ordens de Serviço</h2>
        </div>
        {canAccess(user?.profile, 'orcamentos') ? (
          <Button icon={Plus} onClick={openForm}>
            Nova OS
          </Button>
        ) : null}
      </div>

      <Card className="table-card">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Motor</th>
              <th>Status</th>
              <th>Setor</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const client = clients.find((item) => item.id === order.clientId);
              const motor = motors.find((item) => item.id === order.motorId);
              return (
                <tr key={order.id}>
                  <td data-label="Número">{order.number}</td>
                  <td data-label="Cliente">{client?.name}</td>
                  <td data-label="Motor">{motor?.identification}</td>
                  <td data-label="Status">
                    <StatusBadge status={order.status} />
                  </td>
                  <td data-label="Setor">{order.currentSector}</td>
                  <td data-label="Prioridade">{order.priority}</td>
                  <td data-label="Ações">
                    <div className="row-actions">
                      <Link to={`/ordens-servico/${order.id}`} className="btn btn-outline">
                        <Eye size={18} /> <span>Detalhes</span>
                      </Link>
                      {canAccess(user?.profile, 'qrcode') ? (
                        <Link to={`/qrcode/${order.id}`} className="btn btn-outline">
                          <QrCode size={18} /> <span>QR Code</span>
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <section className="grid-2">
        {orders.slice(0, 4).map((order) => (
          <OSCard
            key={order.id}
            order={order}
            client={clients.find((client) => client.id === order.clientId)}
            motor={motors.find((motor) => motor.id === order.motorId)}
            compact
          />
        ))}
      </section>

      <Modal title="Criar Ordem de Serviço" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveOrder}>
          <CpfCnpjInput
            value={form.clientDocument}
            loading={cnpjLoading}
            onChange={handleDocumentLookup}
            onValidate={() => handleDocumentLookup(form.clientDocument)}
            onSearchCnpj={handleCnpjLookup}
          />
          {lookupMessage ? <p className="status status-cyan span-2">{lookupMessage}</p> : null}
          <Select
            label="Cliente"
            value={form.clientId}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            onChange={(event) => handleClientChange(event.target.value)}
          />
          <Select
            label="Motor"
            value={form.motorId}
            options={availableMotors.map((motor) => ({ value: motor.id, label: `${motor.identification} · ${motor.brand}` }))}
            onChange={(event) => setForm({ ...form, motorId: event.target.value })}
          />
          <Input
            label="Previsão"
            type="date"
            value={form.expectedAt}
            onChange={(event) => setForm({ ...form, expectedAt: event.target.value })}
          />
          <Select
            label="Prioridade"
            value={form.priority}
            options={['Baixa', 'Média', 'Alta']}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          />
          <label className="field span-2">
            <span>Descrição inicial</span>
            <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required />
          </label>
          <div className="form-actions">
            <Button type="submit">Gerar OS</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
