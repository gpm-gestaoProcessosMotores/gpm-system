import { Play, Save, SquareCheckBig } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import FileUpload from '../components/FileUpload.jsx';
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

    if (!draft.checklist.length) {
      window.alert('Crie pelo menos um item no checklist antes de finalizar a etapa.');
      return;
    }

    if (draft.checklist.some((item) => !item.done)) {
      window.alert('Conclua todos os itens do checklist antes de finalizar a etapa.');
      return;
    }

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

      {activeStage ? (
        <section className="technical-block-layout">
          <Card className="technical-block technical-block-stages" interactive={false}>
            <div className="technical-block-heading">
              <div>
                <span className="technical-block-number">Bloco 01</span>
                <h3>Etapa do serviço</h3>
              </div>
              <span className="technical-block-count">{completedStages}/3</span>
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

          <motion.div
            className="technical-stage-details"
            key={activeStageKey}
            initial={{ opacity: 0.65, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="technical-block technical-block-selected technical-stage-shadow" interactive={false}>
              <div className="technical-block-heading">
                <div>
                  <span className="technical-block-number">Bloco 02</span>
                  <h3>Etapa selecionada</h3>
                  <p>{activeStage.sector}</p>
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
            </Card>

            <Card className="technical-block technical-block-checklist technical-stage-shadow" interactive={false}>
              <div className="technical-block-heading">
                <div>
                  <span className="technical-block-number">Bloco 03</span>
                  <h3>Checklist</h3>
                </div>
                <span className="technical-block-count">{activeStage.checklist.length} item(ns)</span>
              </div>
              <Checklist
                items={activeStage.checklist}
                readonly={activeDisabled}
                editable
                onChange={(checklist) => updateDraft(activeStageKey, { checklist })}
              />
            </Card>

            <Card className="technical-block technical-block-description technical-stage-shadow" interactive={false}>
              <div className="technical-block-heading">
                <div>
                  <span className="technical-block-number">Bloco 04</span>
                  <h3>Descrição</h3>
                </div>
              </div>
              <label className="field">
                <span>Serviço realizado / laudo técnico</span>
                <textarea
                  value={activeStage.report}
                  disabled={activeDisabled}
                  onChange={(event) => updateDraft(activeStageKey, { report: event.target.value })}
                />
              </label>
            </Card>

            <Card className="technical-block technical-block-files technical-stage-shadow" interactive={false}>
              <div className="technical-block-heading">
                <div>
                  <span className="technical-block-number">Bloco 05</span>
                  <h3>Envio de arquivos</h3>
                </div>
                <span className="technical-block-count">{activeStage.attachments.length} arquivo(s)</span>
              </div>
              <FileUpload
                files={activeStage.attachments}
                disabled={activeDisabled}
                title="Evidências técnicas"
                description="Fotos, PDFs ou documentos da execução"
                onChange={(attachments) => updateDraft(activeStageKey, { attachments })}
              />
            </Card>

            <div className="technical-flow-footer">
              <div>
                {activeLocked ? <p className="form-error">A etapa anterior ainda não foi concluída.</p> : null}
                {!activeAllowed ? <p className="form-error">Seu perfil não permite editar esta etapa.</p> : null}
              </div>
              <div className="row-actions technical-actions">
                <Button
                  icon={Play}
                  disabled={activeDisabled || activeStage.status !== 'Pendente'}
                  onClick={() => startStage(activeStageKey)}
                >
                  Iniciar
                </Button>
                <Button variant="outline" icon={Save} disabled={activeDisabled} onClick={() => saveStage(activeStageKey)}>
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
            </div>
          </motion.div>
        </section>
      ) : null}
    </div>
  );
}
