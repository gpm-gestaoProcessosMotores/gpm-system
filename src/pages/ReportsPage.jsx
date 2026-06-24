import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../components/Card.jsx';
import { reportService } from '../services/reportService.js';

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--ring))',
  'hsl(var(--secondary-foreground))',
  'hsl(var(--status-warning-fg))',
  'hsl(var(--destructive))',
];

export default function ReportsPage() {
  const report = reportService.management();
  const mainBottleneck = [...report.bottlenecks].sort((a, b) => b.total - a.total)[0]?.name;

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Indicadores</p>
          <h2>Desempenho operacional</h2>
        </div>
      </div>

      <section className="grid-4 metrics-section">
        <Card className="metric-card">
          <span>OS concluídas no mês</span>
          <strong>{report.completedThisMonth}</strong>
        </Card>
        <Card className="metric-card">
          <span>Maior gargalo</span>
          <strong>{mainBottleneck}</strong>
        </Card>
        <Card className="metric-card">
          <span>Tempo médio mecânica</span>
          <strong>3,8h</strong>
        </Card>
        <Card className="metric-card">
          <span>Tempo médio elétrica</span>
          <strong>5,2h</strong>
        </Card>
      </section>

      <section className="grid-2 chart-grid">
        <Card className="chart-card">
          <h3>Quantidade de OS por status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={report.statuses} dataKey="total" nameKey="name" outerRadius={92} label>
                {report.statuses.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <h3>Tempo médio por setor</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.sectorTimes}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <Card className="chart-card">
        <h3>Gargalos por etapa</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report.bottlenecks}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
