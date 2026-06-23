import { ArrowLeft, FileText, QrCode, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService, stageOrder } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const order = osService.getVisibleOrdersForUser(user).find((item) => item.id === id);
  const client = clientService.findById(order?.clientId);
  const motor = motorService.findById(order?.motorId);

  if (!order) {
    return (
      <Card className="stage-card">
        <h2>OS não encontrada</h2>
        <Link className="text-link" to="/ordens-servico">
          Voltar para ordens
        </Link>
      </Card>
    );
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{order.number}</p>
          <h2>{client?.name}</h2>
        </div>
        <Link to="/ordens-servico" className="btn btn-outline">
          <ArrowLeft size={18} /> <span>Voltar</span>
        </Link>
      </div>

      <section className="grid-3">
        <Card className="metric-card">
          <span>Status</span>
          <StatusBadge status={order.status} />
        </Card>
        <Card className="metric-card">
          <span>Código do cliente</span>
          <strong>{order.trackingCode}</strong>
        </Card>
        <Card className="metric-card">
          <span>Setor atual</span>
          <strong>{order.currentSector}</strong>
        </Card>
        <Card className="metric-card">
          <span>Abertura</span>
          <strong>{formatDateTime(order.openedAt)}</strong>
        </Card>
      </section>

      <section className="grid-2">
        <Card className="stage-card">
          <p className="eyebrow">Cliente</p>
          <h3>{client?.name}</h3>
          <div className="meta-grid">
            <span>{client?.document}</span>
            <span>{client?.phone}</span>
            <span>{client?.email}</span>
            <span>{client?.address}</span>
          </div>
        </Card>
        <Card className="stage-card">
          <p className="eyebrow">Motor</p>
          <h3>{motor?.identification}</h3>
          <div className="meta-grid">
            <span>{motor?.brand} · {motor?.model}</span>
            <span>{motor?.power} · {motor?.voltage}</span>
            <span>{motor?.rotation}</span>
            <span>{motor?.notes}</span>
          </div>
        </Card>
      </section>

      <Card className="stage-card">
        <p className="eyebrow">Descrição da OS</p>
        <p>{order.summary}</p>
        <div className="row-actions">
          <Link to={`/tecnico/${order.id}`} className="btn btn-primary">
            <Wrench size={18} /> <span>Fluxo técnico</span>
          </Link>
          <Link to={`/qrcode/${order.id}`} className="btn btn-outline">
            <QrCode size={18} /> <span>QR Code</span>
          </Link>
          <Link to="/laudos" className="btn btn-outline">
            <FileText size={18} /> <span>Laudos</span>
          </Link>
        </div>
      </Card>

      <section className="grid-3">
        {stageOrder.map((stageKey) => {
          const stage = order.stages[stageKey];
          return (
            <Card className="stage-card" key={stageKey}>
              <div className="stage-header">
                <h3>{stage.sector}</h3>
                <StatusBadge status={stage.status} />
              </div>
              <div className="meta-grid">
                <span>Início: {formatDateTime(stage.startedAt)}</span>
                <span>Término: {formatDateTime(stage.finishedAt)}</span>
                <span>Técnico: {stage.technician || 'Não definido'}</span>
              </div>
              <p className="muted">{stage.report || 'Laudo ainda não registrado.'}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
