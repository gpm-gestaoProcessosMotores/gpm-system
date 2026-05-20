import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService } from '../services/osService.js';

const sectorRoutes = {
  mecanica: '/mecanica',
  usinagem: '/usinagem',
  eletrica: '/eletrica',
};

export default function TechnicalSectorPage({ sectorName, stageKey, title }) {
  const orders = osService.getOrdersByCurrentSector(sectorName);
  const clients = clientService.getClients();
  const motors = motorService.list();

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Setor técnico</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="grid-3">
        {orders.map((order) => {
          const client = clients.find((item) => item.id === order.clientId);
          const motor = motors.find((item) => item.id === order.motorId);
          const stage = order.stages[stageKey];

          return (
            <Card className="stage-card" key={order.id}>
              <div className="stage-header">
                <div>
                  <p className="eyebrow">{order.number}</p>
                  <h3>{client?.name}</h3>
                </div>
                <StatusBadge status={stage.status} />
              </div>
              <div className="meta-grid">
                <span>Motor: {motor?.identification}</span>
                <span>Defeito: {motor?.reportedDefect || order.summary}</span>
                <span>Etapa atual: {order.currentSector}</span>
              </div>
              <Link className="btn btn-primary" to={`${sectorRoutes[stageKey]}/os/${order.id}`}>
                <ClipboardList size={18} /> <span>Abrir OS</span>
              </Link>
            </Card>
          );
        })}
      </div>

      {!orders.length ? (
        <Card className="stage-card">
          <h3>Nenhuma OS disponível para {sectorName}</h3>
          <p className="muted">As ordens aparecem aqui quando chegam na etapa deste setor.</p>
        </Card>
      ) : null}
    </div>
  );
}
