import { FilePlus2, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { osService, stageOrder } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';

const stageOptions = [
  { value: 'mecanica', label: 'Mecânica' },
  { value: 'usinagem', label: 'Usinagem' },
  { value: 'eletrica', label: 'Elétrica' },
];

export default function TechnicalReportsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(osService.getVisibleOrdersForUser(user));
  const [selectedId, setSelectedId] = useState(orders[0]?.id || '');
  const [stageKey, setStageKey] = useState('mecanica');
  const order = useMemo(() => orders.find((item) => item.id === selectedId), [orders, selectedId]);
  const [draft, setDraft] = useState(order?.stages?.[stageKey]);

  useEffect(() => {
    setDraft(order?.stages?.[stageKey]);
  }, [order, stageKey]);

  const reports = orders.flatMap((currentOrder) =>
    stageOrder
      .map((key) => ({
        order: currentOrder,
        key,
        stage: currentOrder.stages[key],
      }))
      .filter((item) => item.stage.report),
  );

  function saveReport(event) {
    event.preventDefault();
    osService.updateStage(
      order.id,
      stageKey,
      {
        ...draft,
        technician: draft.technician || user?.name,
        status: draft.status === 'Pendente' ? 'Em andamento' : draft.status,
      },
      user?.name,
      'registrou laudo',
    );
    setOrders(osService.getVisibleOrdersForUser(user));
  }

  if (!draft) {
    return <Card className="stage-card">Nenhuma OS disponível para laudo.</Card>;
  }

  return (
    <div className="content-grid">
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Registro técnico</p>
            <h2>Laudo por setor</h2>
          </div>
        </div>

        <Card className="stage-card">
          <form className="form-grid two" onSubmit={saveReport}>
            <Select
              label="Ordem de Serviço"
              value={selectedId}
              options={orders.map((item) => ({ value: item.id, label: item.number }))}
              onChange={(event) => setSelectedId(event.target.value)}
            />
            <Select label="Setor" value={stageKey} options={stageOptions} onChange={(event) => setStageKey(event.target.value)} />
            <Checklist items={draft.checklist} onChange={(checklist) => setDraft({ ...draft, checklist })} />
            <label className="field">
              <span>Descrição do problema</span>
              <textarea value={draft.report} onChange={(event) => setDraft({ ...draft, report: event.target.value })} required />
            </label>
            <label className="upload-drop span-2">
              <FilePlus2 size={22} />
              <span>Anexos mockados</span>
              <input
                type="file"
                multiple
                onChange={(event) => {
                  const fileNames = Array.from(event.target.files || []).map((file) => file.name);
                  setDraft({ ...draft, attachments: [...draft.attachments, ...fileNames] });
                }}
              />
            </label>
            <div className="attachment-list span-2">
              {draft.attachments.map((file) => (
                <span key={file}>{file}</span>
              ))}
            </div>
            <div className="form-actions">
              <Button type="submit" icon={Save}>
                Salvar laudo
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Laudos registrados</p>
            <h2>Histórico técnico</h2>
          </div>
        </div>
        <div className="grid-3">
          {reports.map(({ order: reportOrder, key, stage }) => (
            <Card className="stage-card" key={`${reportOrder.id}-${key}`}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">{reportOrder.number}</p>
                  <h3>{stage.sector}</h3>
                </div>
                <StatusBadge status={stage.status} />
              </div>
              <div className="meta-grid">
                <span>Técnico: {stage.technician || 'Não definido'}</span>
                <span>Data/hora: {formatDateTime(stage.finishedAt || stage.startedAt)}</span>
              </div>
              <p>{stage.report}</p>
              <div className="attachment-list">
                {stage.attachments.map((file) => (
                  <span key={file}>{file}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
