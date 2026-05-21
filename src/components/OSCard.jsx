import { ClipboardList, Factory, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/formatters.js';
import Card from './Card.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function OSCard({ order, client, motor, compact = false }) {
  return (
    <Card className="os-card" as="article">
      <div className="os-card-top">
        <div>
          <p className="eyebrow">{order.number}</p>
          <h3>{client?.name || 'Cliente não localizado'}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {!compact ? <p className="muted">{order.summary}</p> : null}

      <div className="meta-grid">
        <span>
          <Factory size={18} /> {motor?.identification || 'Motor não localizado'}
        </span>
        {motor?.brand || motor?.model ? (
          <span>
            <Factory size={18} /> {[motor?.brand, motor?.model].filter(Boolean).join(' ')}
          </span>
        ) : null}
        <span>
          <ClipboardList size={18} /> {order.currentSector}
        </span>
        <span>
          <UserRound size={18} /> {formatDateTime(order.openedAt)}
        </span>
      </div>

      <Link className="text-link" to={`/ordens-servico/${order.id}`}>
        Ver detalhes
      </Link>
    </Card>
  );
}
