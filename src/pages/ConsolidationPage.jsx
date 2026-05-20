import { FileClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { clientService } from '../services/clientService.js';
import { osService, stageOrder } from '../services/osService.js';

export default function ConsolidationPage() {
  const orders = osService.list();
  const clients = clientService.list();
  const technicalOrders = orders.filter((order) => order.status !== 'Aberta');

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h2>Consolidação Técnica</h2>
        </div>
      </div>

      <div className="grid-2">
        {technicalOrders.map((order) => {
          const client = clients.find((item) => item.id === order.clientId);
          const ready = stageOrder.every((key) => order.stages[key].status === 'Concluída');
          return (
            <Card className="stage-card" key={order.id}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">{client?.name}</p>
                  <h3>{order.number}</h3>
                </div>
                <span className={`status ${ready ? 'status-cyan' : 'status-muted'}`}>
                  {ready ? 'Pronto para orçamento' : order.status}
                </span>
              </div>

              <div className="grid-3">
                {stageOrder.map((key) => (
                  <div className="upload-drop" key={key}>
                    <strong>{order.stages[key].sector}</strong>
                    <StatusBadge status={order.stages[key].status} />
                    <span>{order.stages[key].technician || 'Técnico pendente'}</span>
                  </div>
                ))}
              </div>

              <p className="muted">
                {ready ? 'Pronto para orçamento' : 'Aguardando finalização técnica para consolidar orçamento.'}
              </p>
              {ready ? (
                <Link className="btn btn-primary" to="/orcamentos">
                  <FileClock size={18} /> <span>Criar orçamento</span>
                </Link>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
