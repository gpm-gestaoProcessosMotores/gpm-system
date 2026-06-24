import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import FileUpload from '../components/FileUpload.jsx';
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
      <div className="section-heading">
        <div>
          <p className="eyebrow">Registro técnico</p>
          <h2>Laudo por setor</h2>
        </div>
      </div>

      <form className="vertical-block-stack" onSubmit={saveReport}>
        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 01</span>
              <h3>Ordem e setor</h3>
            </div>
          </div>
          <div className="form-grid two">
            <Select
              label="Ordem de Serviço"
              value={selectedId}
              options={orders.map((item) => ({ value: item.id, label: item.number }))}
              onChange={(event) => setSelectedId(event.target.value)}
            />
            <Select label="Setor" value={stageKey} options={stageOptions} onChange={(event) => setStageKey(event.target.value)} />
          </div>
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 02</span>
              <h3>Checklist</h3>
            </div>
            <span className="technical-block-count">{draft.checklist.length} item(ns)</span>
          </div>
          <Checklist items={draft.checklist} editable onChange={(checklist) => setDraft({ ...draft, checklist })} />
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 03</span>
              <h3>Descrição do laudo</h3>
            </div>
          </div>
          <label className="field vertical-description-field">
            <span>Serviço realizado / laudo técnico</span>
            <textarea value={draft.report} onChange={(event) => setDraft({ ...draft, report: event.target.value })} required />
          </label>
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 04</span>
              <h3>Envio de arquivos</h3>
            </div>
            <span className="technical-block-count">{draft.attachments.length} arquivo(s)</span>
          </div>
          <FileUpload
            files={draft.attachments}
            title="Anexos do laudo"
            description="Inclua evidências e documentos técnicos"
            onChange={(attachments) => setDraft({ ...draft, attachments })}
          />
        </Card>

        <div className="vertical-block-actions">
          <Button type="submit" icon={Save}>
            Salvar laudo
          </Button>
        </div>
      </form>

      <Card className="vertical-block vertical-history-block" interactive={false}>
        <div className="technical-block-heading">
          <div>
            <span className="technical-block-number">Bloco 05</span>
            <h3>Histórico técnico</h3>
          </div>
          <span className="technical-block-count">{reports.length} laudo(s)</span>
        </div>

        <div className="vertical-record-list">
          {reports.map(({ order: reportOrder, key, stage }) => (
            <article className="vertical-record" key={`${reportOrder.id}-${key}`}>
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
            </article>
          ))}
          {!reports.length ? <p className="checklist-empty">Nenhum laudo registrado.</p> : null}
        </div>
      </Card>
    </div>
  );
}
