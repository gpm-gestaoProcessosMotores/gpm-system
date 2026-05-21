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
  motorMode: 'new',
  motor: {
    identification: '',
    internalCode: '',
    motorType: '',
    brand: '',
    model: '',
    serialNumber: '',
    power: '',
    voltage: '',
    current: '',
    rotation: '',
    reportedDefect: '',
    notes: '',
    attachments: [],
  },
  expectedAt: '',
  priority: 'Média',
  summary: '',
  clientDocument: '',
};

function getEmptyMotor(clientId = '') {
  return {
    ...emptyOrder.motor,
    clientId,
  };
}

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
    motorId: motors.find((motor) => motor.clientId === clients[0]?.id)?.id || '',
    motor: getEmptyMotor(clients[0]?.id || ''),
  });

  const availableMotors = useMemo(
    () => motors.filter((motor) => !form.clientId || motor.clientId === form.clientId),
    [form.clientId, motors],
  );

  function openForm() {
    const firstClientId = clients[0]?.id || '';
    const firstMotorId = motors.find((motor) => motor.clientId === firstClientId)?.id || '';
    setForm({
      ...emptyOrder,
      clientId: firstClientId,
      motorId: firstMotorId,
      motorMode: 'new',
      motor: getEmptyMotor(firstClientId),
    });
    setLookupMessage('');
    setModalOpen(true);
  }

  function saveOrder(event) {
    event.preventDefault();
    if (!form.clientId) {
      setLookupMessage('Selecione ou localize um cliente antes de gerar a OS.');
      return;
    }

    let motorId = form.motorId;
    const summary = form.summary.trim() || form.motor.reportedDefect.trim();

    if (form.motorMode === 'new') {
      const requiredMotorFields = [
        form.motor.identification,
        form.motor.brand,
        form.motor.model,
        form.motor.power,
        form.motor.voltage,
        form.motor.rotation,
      ];

      if (requiredMotorFields.some((field) => !field.trim())) {
        setLookupMessage('Preencha os dados principais do motor antes de gerar a OS.');
        return;
      }

      const savedMotor = motorService.save({
        ...form.motor,
        clientId: form.clientId,
      });
      motorId = savedMotor.id;
    }

    if (!motorId) {
      setLookupMessage('Selecione um motor existente ou cadastre um novo motor nesta entrada.');
      return;
    }

    if (!summary) {
      setLookupMessage('Informe a descrição inicial ou o defeito informado pelo cliente.');
      return;
    }

    osService.save(
      {
        clientId: form.clientId,
        motorId,
        expectedAt: form.expectedAt,
        priority: form.priority,
        summary,
        clientDocument: form.clientDocument,
      },
      user?.name,
    );
    setOrders(osService.getVisibleOrdersForUser(user));
    setModalOpen(false);
  }

  function handleClientChange(clientId) {
    const firstMotor = motors.find((motor) => motor.clientId === clientId);
    setForm({
      ...form,
      clientId,
      motorId: firstMotor?.id || '',
      motor: { ...form.motor, clientId },
    });
  }

  function handleDocumentLookup(document) {
    setForm({ ...form, clientDocument: document });
    const client = documentService.searchClientByDocument(document);
    if (!client) {
      setLookupMessage('Cliente não encontrado. Cadastre o cliente completo antes de criar a OS.');
      return;
    }

    const firstMotor = motors.find((motor) => motor.clientId === client.id);
    setForm({
      ...form,
      clientDocument: document,
      clientId: client.id,
      motorId: firstMotor?.id || '',
      motor: { ...form.motor, clientId: client.id },
    });
    setLookupMessage(`Cliente localizado: ${client.name}`);
  }

  function updateMotor(values) {
    setForm((current) => ({
      ...current,
      motor: {
        ...current.motor,
        ...values,
      },
    }));
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

      <Modal title="Entrada de motor e criação da OS" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveOrder}>
          <div className="span-2 form-section-title">
            <p className="eyebrow">1. Cliente</p>
            <h3>Localize ou selecione o cliente</h3>
          </div>
          <CpfCnpjInput
            value={form.clientDocument}
            loading={cnpjLoading}
            onChange={handleDocumentLookup}
            onValidate={() => handleDocumentLookup(form.clientDocument)}
            onSearchCnpj={handleCnpjLookup}
            required={false}
          />
          {lookupMessage ? <p className="status status-cyan span-2">{lookupMessage}</p> : null}
          <Select
            label="Cliente"
            value={form.clientId}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            onChange={(event) => handleClientChange(event.target.value)}
          />

          <div className="span-2 form-section-title">
            <p className="eyebrow">2. Motor</p>
            <h3>Cadastre o motor nesta entrada ou escolha um existente</h3>
          </div>
          <div className="segmented-control span-2" role="group" aria-label="Tipo de entrada do motor">
            <button
              type="button"
              className={form.motorMode === 'new' ? 'is-active' : ''}
              onClick={() => setForm({ ...form, motorMode: 'new' })}
            >
              Cadastrar novo motor
            </button>
            <button
              type="button"
              className={form.motorMode === 'existing' ? 'is-active' : ''}
              disabled={!availableMotors.length}
              onClick={() => setForm({ ...form, motorMode: 'existing', motorId: availableMotors[0]?.id || '' })}
            >
              Usar motor existente
            </button>
          </div>

          {form.motorMode === 'existing' ? (
            <Select
              label="Motor existente"
              value={form.motorId}
              options={
                availableMotors.length
                  ? availableMotors.map((motor) => ({
                      value: motor.id,
                      label: `${motor.internalCode || motor.identification} · ${motor.brand} ${motor.model}`,
                    }))
                  : [{ value: '', label: 'Nenhum motor cadastrado para este cliente' }]
              }
              onChange={(event) => setForm({ ...form, motorId: event.target.value })}
            />
          ) : (
            <>
              <Input
                label="Código interno do motor"
                value={form.motor.internalCode}
                onChange={(event) => updateMotor({ internalCode: event.target.value })}
              />
              <Input
                label="Identificação"
                value={form.motor.identification}
                onChange={(event) => updateMotor({ identification: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <Input
                label="Tipo de motor"
                value={form.motor.motorType}
                onChange={(event) => updateMotor({ motorType: event.target.value })}
              />
              <Input
                label="Marca"
                value={form.motor.brand}
                onChange={(event) => updateMotor({ brand: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <Input
                label="Modelo"
                value={form.motor.model}
                onChange={(event) => updateMotor({ model: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <Input
                label="Número de série"
                value={form.motor.serialNumber}
                onChange={(event) => updateMotor({ serialNumber: event.target.value })}
              />
              <Input
                label="Potência"
                value={form.motor.power}
                onChange={(event) => updateMotor({ power: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <Input
                label="Tensão"
                value={form.motor.voltage}
                onChange={(event) => updateMotor({ voltage: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <Input
                label="Corrente"
                value={form.motor.current}
                onChange={(event) => updateMotor({ current: event.target.value })}
              />
              <Input
                label="Rotação RPM"
                value={form.motor.rotation}
                onChange={(event) => updateMotor({ rotation: event.target.value })}
                required={form.motorMode === 'new'}
              />
              <label className="field span-2">
                <span>Defeito informado pelo cliente</span>
                <textarea
                  value={form.motor.reportedDefect}
                  onChange={(event) => updateMotor({ reportedDefect: event.target.value })}
                  required={form.motorMode === 'new' && !form.summary.trim()}
                />
              </label>
              <label className="field span-2">
                <span>Observações do motor</span>
                <textarea value={form.motor.notes} onChange={(event) => updateMotor({ notes: event.target.value })} />
              </label>
              <label className="upload-drop span-2">
                <span>Fotos/anexos mockados</span>
                <input
                  type="file"
                  multiple
                  onChange={(event) => {
                    const fileNames = Array.from(event.target.files || []).map((file) => file.name);
                    updateMotor({ attachments: [...(form.motor.attachments || []), ...fileNames] });
                  }}
                />
              </label>
              <div className="attachment-list span-2">
                {form.motor.attachments?.length ? form.motor.attachments.map((file) => <span key={file}>{file}</span>) : <span>Sem anexos</span>}
              </div>
            </>
          )}

          <div className="span-2 form-section-title">
            <p className="eyebrow">3. Ordem de Serviço</p>
            <h3>Defina a prioridade e gere a OS</h3>
          </div>
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
            <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
          </label>
          <div className="form-actions span-2">
            <Button type="submit">Salvar motor e gerar OS</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
