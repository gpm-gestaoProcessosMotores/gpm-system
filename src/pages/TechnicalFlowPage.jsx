import { FilePlus2, Play, Save, SquareCheckBig } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService, stageOrder } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';
import { getTechnicalSectorByProfile } from '../utils/technicalStages.js';

function getStageKeyBySector(sector) {
  const map = {
    Mecânica: 'mecanica',
    Usinagem: 'usinagem',
    Elétrica: 'eletrica',
  };
  return map[sector] || '';
}

function getSuggestedStageKey(order) {
  if (!order) {
    return 'mecanica';
  }

  return getStageKeyBySector(order.currentSector) || stageOrder.find((key) => order.stages?.[key]?.status !== 'Concluída') || 'mecanica';
}

export default function TechnicalFlowPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState(osService.getVisibleOrdersForUser(user));
  const [selectedId, setSelectedId] = useState(id || orders[0]?.id || '');
  const order = useMemo(() => orders.find((item) => item.id === selectedId), [orders, selectedId]);
  const clients = clientService.list();
  const motors = motorService.list();
  const client = clients.find((item) => item.id === order?.clientId);
  const motor = motors.find((item) => item.id === order?.motorId);
  const [draftStages, setDraftStages] = useState(order?.stages || {});
  const [activeStageKey, setActiveStageKey] = useState(getSuggestedStageKey(order));

  useEffect(() => {
    setDraftStages(order?.stages || {});
    setActiveStageKey(getSuggestedStageKey(order));
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

  const activeStage = draftStages[activeStageKey] || order.stages?.[activeStageKey];
  const completedStages = stageOrder.filter((stageKey) => draftStages[stageKey]?.status === 'Concluída').length;
  const activeLocked = isLocked(activeStageKey);
  const activeAllowed = canOperate(activeStageKey);
  const activeDisabled = activeLocked || !activeAllowed;

  return (
    <div className="content-grid technical-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Área técnica integrada</p>
          <h2>Painel de execução da OS</h2>
        </div>
      </div>

      <Card className="technical-command-bar">
        <Select
          label="Ordem de Serviço"
          value={selectedId}
          options={orders.map((item) => ({ value: item.id, label: `${item.number} · ${item.trackingCode} · ${item.status}` }))}
          onChange={(event) => setSelectedId(event.target.value)}
        />
        <div className="technical-command-metrics">
          <div>
            <span>Status</span>
            <StatusBadge status={order.status} />
          </div>
          <div>
            <span>Código cliente</span>
            <strong>{order.trackingCode}</strong>
          </div>
          <div>
            <span>Progresso</span>
            <strong>{completedStages}/3 etapas</strong>
          </div>
        </div>
      </Card>

      <Card className="technical-order-summary">
        <div className="stage-header">
          <div>
            <p className="eyebrow">{order.number}</p>
            <h3>{client?.name || 'Cliente não localizado'}</h3>
          </div>
          <StatusBadge status={order.currentSector} />
        </div>
        <div className="meta-grid">
          <span>Motor: {motor?.identification || 'Não informado'}</span>
          <span>Modelo: {[motor?.brand, motor?.model].filter(Boolean).join(' ') || 'Não informado'}</span>
          <span>Defeito: {motor?.reportedDefect || order.summary}</span>
        </div>
      </Card>

      <section className="technical-workspace">
        <Card className="technical-stage-rail">
          <div className="technical-rail-header">
            <div>
              <p className="eyebrow">Etapas do serviço</p>
              <strong>Fluxo técnico</strong>
            </div>
            <span>{completedStages}/3</span>
          </div>
          <div className="technical-progress" aria-hidden="true">
            <span style={{ width: `${(completedStages / stageOrder.length) * 100}%` }} />
          </div>
          <div className="technical-stepper" aria-label="Etapas técnicas">
            {stageOrder.map((stageKey) => {
              const stage = draftStages[stageKey] || order.stages?.[stageKey];
              const locked = isLocked(stageKey);

              return (
                <button
                  type="button"
                  className={`technical-step ${activeStageKey === stageKey ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
                  key={stageKey}
                  onClick={() => setActiveStageKey(stageKey)}
                >
                  <span className="technical-step-index">{stageOrder.indexOf(stageKey) + 1}</span>
                  <span>
                    <strong>{stage.sector}</strong>
                    <small>{locked ? 'Aguardando etapa anterior' : stage.status}</small>
                  </span>
                  <StatusBadge status={stage.status} />
                </button>
              );
            })}
          </div>
        </Card>

        {activeStage ? (
          <Card className="stage-card technical-stage-panel">
            <div className="stage-header">
              <div>
                <p className="eyebrow">Etapa selecionada</p>
                <h3>{activeStage.sector}</h3>
              </div>
              <StatusBadge status={activeStage.status} />
            </div>

            <div className="technical-stage-meta">
              <div>
                <span>Início</span>
                <strong>{formatDateTime(activeStage.startedAt)}</strong>
              </div>
              <div>
                <span>Término</span>
                <strong>{formatDateTime(activeStage.finishedAt)}</strong>
              </div>
              <div>
                <span>Técnico</span>
                <strong>{activeStage.technician || user?.name}</strong>
              </div>
            </div>

            <div className="technical-editor-grid">
              <div className="technical-checklist-box">
                <p className="eyebrow">Checklist</p>
                <Checklist
                  items={activeStage.checklist}
                  readonly={activeDisabled}
                  onChange={(checklist) => updateDraft(activeStageKey, { checklist })}
                />
              </div>

              <div className="technical-report-box">
                <label className="field">
                  <span>Serviço realizado / laudo técnico</span>
                  <textarea
                    value={activeStage.report}
                    disabled={activeDisabled}
                    onChange={(event) => updateDraft(activeStageKey, { report: event.target.value })}
                  />
                </label>

                <label className="upload-drop compact-upload">
                  <FilePlus2 size={20} />
                  <span>Anexar fotos/PDFs mockados</span>
                  <input
                    type="file"
                    multiple
                    disabled={activeDisabled}
                    onChange={(event) => {
                      const fileNames = Array.from(event.target.files || []).map((file) => file.name);
                      updateDraft(activeStageKey, { attachments: [...activeStage.attachments, ...fileNames] });
                    }}
                  />
                </label>

                <div className="attachment-list">
                  {activeStage.attachments.length ? activeStage.attachments.map((file) => <span key={file}>{file}</span>) : <span>Sem anexos</span>}
                </div>
              </div>
            </div>

            <div className="row-actions technical-actions">
              <Button
                icon={Play}
                disabled={activeDisabled || activeStage.status !== 'Pendente'}
                onClick={() => startStage(activeStageKey)}
              >
                Iniciar
              </Button>
              <Button
                variant="outline"
                icon={Save}
                disabled={activeDisabled}
                onClick={() => saveStage(activeStageKey)}
              >
                Salvar
              </Button>
              <Button
                variant="secondary"
                icon={SquareCheckBig}
                disabled={activeDisabled || activeStage.status !== 'Em andamento'}
                onClick={() => finishStage(activeStageKey)}
              >
                Finalizar
              </Button>
            </div>

            {activeLocked ? <p className="form-error">A etapa anterior ainda não foi concluída.</p> : null}
            {!activeAllowed ? <p className="form-error">Seu perfil não permite editar esta etapa.</p> : null}
          </Card>
        ) : null}
      </section>
    </div>
  );
}
