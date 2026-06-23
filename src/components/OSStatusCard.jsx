import { CalendarClock, ClipboardList, Factory, UserRound } from 'lucide-react';
import { formatDateTime } from '../utils/formatters.js';
import { maskDocument } from '../utils/validators.js';
import Card from './Card.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function OSStatusCard({ order, client, motor, budget }) {
  if (!order) {
    return null;
  }

  return (
    <Card className="os-status-card">
      <div className="stage-header">
        <div>
          <p className="eyebrow">Resultado da consulta</p>
          <h2>{order.number}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="status-summary">
        <div>
          <UserRound size={20} />
          <span>Cliente</span>
          <strong>{client?.name}</strong>
          <small>{maskDocument(client?.document)}</small>
        </div>
        <div>
          <Factory size={20} />
          <span>Motor</span>
          <strong>{motor?.identification}</strong>
        </div>
        <div>
          <ClipboardList size={20} />
          <span>Código de acompanhamento</span>
          <strong>{order.trackingCode}</strong>
        </div>
        <div>
          <ClipboardList size={20} />
          <span>Etapa atual</span>
          <strong>{order.currentSector}</strong>
        </div>
        <div>
          <CalendarClock size={20} />
          <span>Previsão</span>
          <strong>{order.expectedAt ? formatDateTime(`${order.expectedAt}T12:00:00`) : 'Não definida'}</strong>
        </div>
      </div>

      <div className="upload-drop">
        <strong>Situação do orçamento</strong>
        <span>{budget?.status || 'Ainda não emitido'}</span>
      </div>
      <p className="muted">Entrada registrada em {formatDateTime(order.openedAt)}.</p>
    </Card>
  );
}
