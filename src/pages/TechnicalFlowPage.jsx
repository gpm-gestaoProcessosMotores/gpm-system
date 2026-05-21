import { FilePlus2, Play, Save, SquareCheckBig } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { osService, stageOrder } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';
import { getTechnicalSectorByProfile } from '../utils/technicalStages.js';

export default function TechnicalFlowPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState(osService.getVisibleOrdersForUser(user));
  const [selectedId, setSelectedId] = useState(id || orders[0]?.id || '');
  const order = useMemo(() => orders.find((item) => item.id === selectedId), [orders, selectedId]);
  const [draftStages, setDraftStages] = useState(order?.stages || {});

  useEffect(() => {
    setDraftStages(order?.stages || {});
  }, [order]);

  function refresh(updatedOrderId = selectedId) {
    const nextOrders = osService.getVisibleOrdersForUser(user);
    setOrders(nextOrders);
    setSelectedId(updatedOrderId);
  }

  function updateDraft(stageKey, values) {
    setDraftStages((current) => ({
      ...current,
      [stageKey]: {
        ...current[stageKey],
        ...values,
      },
    }));
  }

  function canOperate(stageKey) {
    const allowedSector = getTechnicalSectorByProfile(user?.profile);
    if (!allowedSector) {
      return user?.profile !== 'Gestor';
    }
    return draftStages[stageKey]?.sector === allowedSector;
  }

  function isLocked(stageKey) {
    const index = stageOrder.indexOf(stageKey);
    if (index <= 0) {
      return false;
    }
    return stageOrder.slice(0, index).some((key) => draftStages[key]?.status !== 'Concluída');
  }

  function startStage(stageKey) {
    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        status: 'Em andamento',
        technician: user?.name || '',
        startedAt: draftStages[stageKey].startedAt || new Date().toISOString(),
      },
      user?.name,
      'iniciou etapa',
    );
    refresh(updated.id);
  }

  function saveStage(stageKey) {
    const draft = draftStages[stageKey];
    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        checklist: draft.checklist,
        report: draft.report,
        attachments: draft.attachments,
        technician: draft.technician || user?.name || '',
      },
      user?.name,
      'registrou laudo',
    );
    refresh(updated.id);
  }

  function finishStage(stageKey) {
    const draft = draftStages[stageKey];

    if (!draft.report.trim()) {
      window.alert('Descreva o serviço realizado antes de finalizar a etapa.');
      return;
    }

    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        checklist: draft.checklist,
        report: draft.report,
        attachments: draft.attachments,
        status: 'Concluída',
        technician: draft.technician || user?.name || '',
        finishedAt: new Date().toISOString(),
      },
      user?.name,
      'finalizou etapa',
    );
    refresh(updated.id);
  }

  if (!order) {
    return <Card className="stage-card">Nenhuma ordem disponível para fluxo técnico.</Card>;
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Execução técnica</p>
          <h2>{order.number}</h2>
        </div>
      </div>

      <div className="grid-2">
        <Select
          label="Ordem de Serviço"
          value={selectedId}
          options={orders.map((item) => ({ value: item.id, label: `${item.number} · ${item.status}` }))}
          onChange={(event) => setSelectedId(event.target.value)}
        />
        <Card className="metric-card">
          <span>Status da OS</span>
          <StatusBadge status={order.status} />
        </Card>
      </div>

      <section className="grid-3">
        {stageOrder.map((stageKey) => {
          const stage = draftStages[stageKey];
          const locked = isLocked(stageKey);
          const allowed = canOperate(stageKey);
          const disabled = locked || !allowed;

          return (
            <Card className="stage-card" key={stageKey}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">Etapa</p>
                  <h3>{stage.sector}</h3>
                </div>
                <StatusBadge status={stage.status} />
              </div>

              <div className="meta-grid">
                <span>Início: {formatDateTime(stage.startedAt)}</span>
                <span>Término: {formatDateTime(stage.finishedAt)}</span>
                <span>Técnico: {stage.technician || user?.name}</span>
              </div>

              <p className="muted">Os itens abaixo são opcionais. Use a descrição para registrar o serviço feito no motor.</p>

              <Checklist
                items={stage.checklist}
                readonly={disabled}
                onChange={(checklist) => updateDraft(stageKey, { checklist })}
              />

              <label className="field">
                <span>Serviço realizado / laudo técnico</span>
                <textarea
                  value={stage.report}
                  disabled={disabled}
                  onChange={(event) => updateDraft(stageKey, { report: event.target.value })}
                />
              </label>

              <label className="upload-drop">
                <FilePlus2 size={22} />
                <span>Anexar fotos/PDFs mockados</span>
                <input
                  type="file"
                  multiple
                  disabled={disabled}
                  onChange={(event) => {
                    const fileNames = Array.from(event.target.files || []).map((file) => file.name);
                    updateDraft(stageKey, { attachments: [...stage.attachments, ...fileNames] });
                  }}
                />
              </label>

              <div className="attachment-list">
                {stage.attachments.length ? stage.attachments.map((file) => <span key={file}>{file}</span>) : <span>Sem anexos</span>}
              </div>

              <div className="row-actions">
                <Button
                  icon={Play}
                  disabled={disabled || stage.status !== 'Pendente'}
                  onClick={() => startStage(stageKey)}
                >
                  Iniciar etapa
                </Button>
                <Button
                  variant="outline"
                  icon={Save}
                  disabled={disabled}
                  onClick={() => saveStage(stageKey)}
                >
                  Salvar laudo
                </Button>
                <Button
                  variant="secondary"
                  icon={SquareCheckBig}
                  disabled={disabled || stage.status !== 'Em andamento'}
                  onClick={() => finishStage(stageKey)}
                >
                  Finalizar etapa
                </Button>
              </div>
              {locked ? <p className="form-error">Etapa anterior ainda não foi concluída.</p> : null}
            </Card>
          );
        })}
      </section>
    </div>
  );
}
