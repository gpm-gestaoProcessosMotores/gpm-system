import { Edit3, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import FileUpload from '../components/FileUpload.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import Select from '../components/Select.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';

const emptyMotor = {
  clientId: '',
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
  frame: '',
  frequency: '',
  protection: '',
  constructionForm: '',
  reportedDefect: '',
  notes: '',
  attachments: [],
};

export default function MotorsPage() {
  const clients = clientService.getClients();
  const [motors, setMotors] = useState(motorService.list());
  const [form, setForm] = useState({ ...emptyMotor, clientId: clients[0]?.id || '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function refresh() {
    setMotors(motorService.list());
  }

  function openForm(motor) {
    setForm(motor || { ...emptyMotor, clientId: clients[0]?.id || '' });
    setError('');
    setMessage('');
    setModalOpen(true);
  }

  function saveMotor(event) {
    event.preventDefault();
    if (!form.clientId) {
      setError('Motor deve estar vinculado a um cliente.');
      return;
    }
    motorService.save(form);
    refresh();
    setModalOpen(false);
  }

  function removeMotor(motor) {
    const linkedOrders = motorService.getLinkedOrders(motor.id);
    const shouldRemove = linkedOrders.length
      ? window.confirm(
          `Este motor possui ${linkedOrders.length} OS vinculada(s). Ao excluir o motor, essas OS também sairão das etapas técnicas. Deseja continuar?`,
        )
      : window.confirm('Deseja excluir este motor?');

    if (!shouldRemove) {
      return;
    }

    const result = motorService.remove(motor.id);
    refresh();
    setMessage(
      result.removedOrdersCount
        ? `Motor excluído. ${result.removedOrdersCount} OS vinculada(s) foram removidas das etapas.`
        : 'Motor excluído.',
    );
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ativos dos clientes</p>
          <h2>Motores</h2>
        </div>
        <Button icon={Plus} onClick={() => openForm()}>
          Novo motor
        </Button>
      </div>
      {message ? <p className="status status-cyan">{message}</p> : null}

      <div className="grid-3">
        {motors.map((motor) => {
          const client = clients.find((item) => item.id === motor.clientId);
          return (
            <Card className="stage-card" key={motor.id}>
              <div>
                <p className="eyebrow">{client?.name || 'Cliente não localizado'}</p>
                <h3>{motor.internalCode || motor.identification}</h3>
              </div>
              <div className="meta-grid">
                <span>{motor.motorType || 'Motor'} · {motor.brand} · {motor.model}</span>
                <span>Série: {motor.serialNumber || 'Não informada'}</span>
                <span>{motor.power} · {motor.voltage} · {motor.current || 'corrente n/d'} · {motor.rotation}</span>
                <span>{motor.frame} · {motor.frequency} · {motor.protection} · {motor.constructionForm}</span>
              </div>
              <p className="muted">{motor.reportedDefect || motor.notes}</p>
              <div className="attachment-list">
                {motor.attachments?.length ? motor.attachments.map((file) => <span key={file}>{file}</span>) : <span>Sem anexos</span>}
              </div>
              <div className="row-actions">
                <Button variant="outline" icon={Edit3} onClick={() => openForm(motor)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => removeMotor(motor)}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal title={form.id ? 'Editar motor' : 'Cadastrar motor'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveMotor}>
          <Select
            label="Cliente vinculado"
            value={form.clientId}
            options={[{ value: '', label: 'Selecione um cliente' }, ...clients.map((client) => ({ value: client.id, label: client.name }))]}
            onChange={(event) => setForm({ ...form, clientId: event.target.value })}
          />
          <Input
            label="Código interno do motor"
            value={form.internalCode}
            onChange={(event) => setForm({ ...form, internalCode: event.target.value })}
            required
          />
          <Input
            label="Identificação"
            value={form.identification}
            onChange={(event) => setForm({ ...form, identification: event.target.value })}
            required
          />
          <Input label="Tipo de motor" value={form.motorType} onChange={(event) => setForm({ ...form, motorType: event.target.value })} />
          <Input label="Marca" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
          <Input label="Modelo" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} required />
          <Input label="Número de série" value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} />
          <Input label="Potência" value={form.power} onChange={(event) => setForm({ ...form, power: event.target.value })} required />
          <Input label="Tensão" value={form.voltage} onChange={(event) => setForm({ ...form, voltage: event.target.value })} required />
          <Input label="Corrente" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} />
          <Input label="Rotação RPM" value={form.rotation} onChange={(event) => setForm({ ...form, rotation: event.target.value })} required />
          <Input label="Carcaça" value={form.frame} onChange={(event) => setForm({ ...form, frame: event.target.value })} />
          <Input label="Frequência Hz" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })} />
          <Input label="Grau de proteção IP" value={form.protection} onChange={(event) => setForm({ ...form, protection: event.target.value })} />
          <Input label="Forma construtiva" value={form.constructionForm} onChange={(event) => setForm({ ...form, constructionForm: event.target.value })} />
          <label className="field span-2">
            <span>Defeito informado pelo cliente</span>
            <textarea value={form.reportedDefect} onChange={(event) => setForm({ ...form, reportedDefect: event.target.value })} required />
          </label>
          <label className="field span-2">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <FileUpload
            className="span-2"
            files={form.attachments || []}
            title="Fotos e documentos do motor"
            description="Inclua registros de identificação e inspeção"
            onChange={(attachments) => setForm({ ...form, attachments })}
          />
          {error ? <p className="form-error span-2">{error}</p> : null}
          <div className="form-actions span-2">
            <Button type="submit" icon={Save}>Salvar motor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
