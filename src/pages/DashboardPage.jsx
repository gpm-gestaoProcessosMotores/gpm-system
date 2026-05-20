import { Clock3, ClipboardCheck, ClipboardList, FileClock, Gauge } from 'lucide-react';
import Card from '../components/Card.jsx';
import OSCard from '../components/OSCard.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { reportService } from '../services/reportService.js';

export default function DashboardPage() {
  const dashboard = reportService.dashboard();
  const clients = clientService.list();
  const motors = motorService.list();
  const metrics = [
    { label: 'OS em aberto', value: dashboard.open, icon: ClipboardList },
    { label: 'OS em andamento', value: dashboard.inProgress, icon: Gauge },
    { label: 'Aguardando orçamento', value: dashboard.waitingBudget, icon: FileClock },
    { label: 'OS concluídas', value: dashboard.done, icon: ClipboardCheck },
    { label: 'Tempo médio por etapa', value: dashboard.averageStageTime, icon: Clock3 },
  ];

  return (
    <div className="content-grid">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Visão operacional</p>
          <h2>Controle de motores, setores e prazos em uma única tela</h2>
          <p>
            Acompanhe o fluxo técnico da oficina, identifique gargalos e mantenha o administrativo pronto para gerar
            orçamento.
          </p>
        </div>
        <div className="dashboard-hero-panel">
          <span>OS no fluxo técnico</span>
          <strong>{dashboard.inProgress}</strong>
          <small>Mecânica, Usinagem e Elétrica</small>
        </div>
      </section>

      <section className="grid-4">
        {metrics.map((metric) => (
          <Card className="metric-card" key={metric.label}>
            <span className="metric-icon">
              <metric.icon size={23} />
            </span>
            <div>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Acompanhamento</p>
            <h2>Ordens recentes</h2>
          </div>
        </div>
        <div className="grid-2">
          {dashboard.recentOrders.map((order) => (
            <OSCard
              key={order.id}
              order={order}
              client={clients.find((client) => client.id === order.clientId)}
              motor={motors.find((motor) => motor.id === order.motorId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
