import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { historyService } from '../services/historyService.js';
import { osService } from '../services/osService.js';
import { formatDateTime } from '../utils/formatters.js';

export default function HistoryPage() {
  const history = historyService.list();
  const orders = osService.list();

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Auditoria</p>
          <h2>Histórico de Alterações</h2>
        </div>
      </div>

      <div className="timeline">
        {history.map((item) => {
          const order = orders.find((current) => current.id === item.orderId);
          return (
            <Card className="timeline-item" key={item.id}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">{formatDateTime(item.createdAt)}</p>
                  <h3>{item.user} {item.action}</h3>
                </div>
                {order ? <StatusBadge status={order.status} /> : null}
              </div>
              <p>{item.detail}</p>
              <span className="muted">{order?.number || 'OS não vinculada'}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
