import { ArrowLeft, FilePlus2, Play, Save, SquareCheckBig } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Checklist from '../components/Checklist.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService, stageOrder } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';
import { getTechnicalSectorByProfile } from '../utils/technicalStages.js';
import { useState } from 'react';

const sectorRoutes = {
  mecanica: '/mecanica',
  usinagem: '/usinagem',
  eletrica: '/eletrica',
};

export default function TechnicalSectorOrderPage({ sectorName, stageKey, title }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(osService.findById(id));
  const [stage, setStage] = useState(order?.stages?.[stageKey]);
  const client = clientService.findById(order?.clientId);
  const motor = motorService.findById(order?.motorId);
  const routeBase = sectorRoutes[stageKey];

  if (!order || !stage) {
    return <Navigate to={routeBase} replace />;
  }

  const previousIncomplete = stageOrder.slice(0, stageOrder.indexOf(stageKey)).some((key) => order.stages[key].status !== 'Concluída');
  const wrongSector = order.currentSector !== sectorName && stage.status === 'Pendente';
  const userSector = getTechnicalSectorByProfile(user?.profile, user?.sector);
  const readOnly = user?.profile === 'Administrador' ? false : userSector !== sectorName;
  const disabled = previousIncomplete || wrongSector || readOnly;

  function refresh(updated) {
    setOrder(updated);
    setStage(updated.stages[stageKey]);
  }

  function startStage() {
    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        status: 'Em andamento',
        technician: user?.name || '',
        startedAt: stage.startedAt || new Date().toISOString(),
      },
      user?.name,
      'iniciou etapa',
    );
    refresh(updated);
  }

  function saveStage() {
    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        checklist: stage.checklist,
        report: stage.report,
        attachments: stage.attachments,
        technician: stage.technician || user?.name || '',
      },
      user?.name,
      'registrou laudo',
    );
    refresh(updated);
  }

  function finishStage() {
    if (!stage.report.trim()) {
      window.alert('Descreva o serviço realizado antes de finalizar a etapa.');
      return;
    }

    const updated = osService.updateStage(
      order.id,
      stageKey,
      {
        checklist: stage.checklist,
        report: stage.report,
        attachments: stage.attachments,
        status: 'Concluída',
        technician: stage.technician || user?.name || '',
        finishedAt: new Date().toISOString(),
      },
      user?.name,
      'finalizou etapa',
    );
    refresh(updated);
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{order.number}</h2>
        </div>
        <Link className="btn btn-outline" to={routeBase}>
          <ArrowLeft size={18} /> <span>Voltar</span>
        </Link>
      </div>

      <section className="grid-2">
        <Card className="stage-card">
          <p className="eyebrow">Cliente e motor</p>
          <h3>{client?.name}</h3>
          <div className="meta-grid">
            <span>Motor: {motor?.identification}</span>
            <span>Marca/modelo: {motor?.brand} {motor?.model}</span>
            <span>Potência: {motor?.power}</span>
            <span>Defeito informado: {motor?.reportedDefect || order.summary}</span>
          </div>
        </Card>
        <Card className="stage-card">
          <p className="eyebrow">Etapa</p>
          <div className="stage-header">
            <h3>{stage.sector}</h3>
            <StatusBadge status={stage.status} />
          </div>
          <div className="meta-grid">
            <span>Início: {formatDateTime(stage.startedAt)}</span>
            <span>Término: {formatDateTime(stage.finishedAt)}</span>
            <span>Técnico: {stage.technician || user?.name}</span>
          </div>
        </Card>
      </section>

      <Card className="stage-card">
        <p className="muted">Marque somente os itens que fizerem sentido para esta OS. A descrição escrita do serviço realizado é o registro principal da etapa.</p>
        <Checklist
          items={stage.checklist}
          readonly={disabled}
          onChange={(checklist) => setStage({ ...stage, checklist })}
        />
        <label className="field">
          <span>Serviço realizado / laudo {stage.sector}</span>
          <textarea value={stage.report} disabled={disabled} onChange={(event) => setStage({ ...stage, report: event.target.value })} />
        </label>
        <label className="upload-drop">
          <FilePlus2 size={22} />
          <span>Anexos mockados</span>
          <input
            type="file"
            multiple
            disabled={disabled}
            onChange={(event) => {
              const fileNames = Array.from(event.target.files || []).map((file) => file.name);
              setStage({ ...stage, attachments: [...stage.attachments, ...fileNames] });
            }}
          />
        </label>
        <div className="attachment-list">
          {stage.attachments.length ? stage.attachments.map((file) => <span key={file}>{file}</span>) : <span>Sem anexos</span>}
        </div>
        <div className="row-actions">
          <Button icon={Play} disabled={disabled || stage.status !== 'Pendente'} onClick={startStage}>
            Iniciar etapa
          </Button>
          <Button variant="outline" icon={Save} disabled={disabled} onClick={saveStage}>
            Salvar laudo
          </Button>
          <Button variant="secondary" icon={SquareCheckBig} disabled={disabled || stage.status !== 'Em andamento'} onClick={finishStage}>
            Finalizar etapa
          </Button>
        </div>
        {previousIncomplete ? <p className="form-error">A etapa anterior ainda não foi concluída.</p> : null}
        {wrongSector ? <p className="form-error">Esta OS ainda não está liberada para {sectorName}.</p> : null}
      </Card>
    </div>
  );
}
