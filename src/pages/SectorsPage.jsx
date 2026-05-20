import { Edit3, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { employeeService } from '../services/employeeService.js';
import { sectorService } from '../services/sectorService.js';

const emptySector = {
  name: '',
  description: '',
  responsible: '',
  employeeIds: [],
  status: 'Ativo',
  flowOrder: 1,
};

export default function SectorsPage() {
  const [sectors, setSectors] = useState(sectorService.list());
  const employees = employeeService.list();
  const [form, setForm] = useState(emptySector);
  const [modalOpen, setModalOpen] = useState(false);

  function refresh() {
    setSectors(sectorService.list());
  }

  function openForm(sector = emptySector) {
    setForm({ ...emptySector, ...sector });
    setModalOpen(true);
  }

  function saveSector(event) {
    event.preventDefault();
    sectorService.save({
      ...form,
      employeeIds: Array.isArray(form.employeeIds) ? form.employeeIds : String(form.employeeIds || '').split(',').filter(Boolean),
      flowOrder: Number(form.flowOrder || 0),
    });
    refresh();
    setModalOpen(false);
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Configuração do fluxo</p>
          <h2>Setores</h2>
        </div>
        <Button icon={Plus} onClick={() => openForm()}>
          Novo setor
        </Button>
      </div>

      <div className="grid-3">
        {sectors
          .slice()
          .sort((a, b) => a.flowOrder - b.flowOrder)
          .map((sector) => (
            <Card className="stage-card" key={sector.id}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">Ordem {sector.flowOrder}</p>
                  <h3>{sector.name}</h3>
                </div>
                <StatusBadge status={sector.status} />
              </div>
              <p className="muted">{sector.description}</p>
              <div className="meta-grid">
                <span>Responsável: {sector.responsible}</span>
                <span>
                  Funcionários:{' '}
                  {sector.employeeIds
                    ?.map((id) => employees.find((employee) => employee.id === id)?.name)
                    .filter(Boolean)
                    .join(', ') || 'Nenhum'}
                </span>
              </div>
              <div className="row-actions">
                <Button variant="outline" icon={Edit3} onClick={() => openForm(sector)}>
                  Editar
                </Button>
                <Button
                  variant="outline"
                  icon={Power}
                  onClick={() => {
                    sectorService.toggleStatus(sector.id);
                    refresh();
                  }}
                >
                  {sector.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
      </div>

      <Modal title={form.id ? 'Editar setor' : 'Cadastrar setor'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid two" onSubmit={saveSector}>
          <Input label="Nome do setor" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input
            label="Responsável"
            value={form.responsible}
            onChange={(event) => setForm({ ...form, responsible: event.target.value })}
            required
          />
          <Input
            label="Ordem no fluxo da OS"
            type="number"
            value={form.flowOrder}
            onChange={(event) => setForm({ ...form, flowOrder: event.target.value })}
            required
          />
          <Select
            label="Status"
            value={form.status}
            options={['Ativo', 'Inativo']}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          />
          <label className="field span-2">
            <span>Descrição</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          </label>
          <label className="field span-2">
            <span>Funcionários vinculados</span>
            <select
              multiple
              value={form.employeeIds}
              onChange={(event) =>
                setForm({
                  ...form,
                  employeeIds: Array.from(event.target.selectedOptions).map((option) => option.value),
                })
              }
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.sector}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions span-2">
            <Button type="submit">Salvar setor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
