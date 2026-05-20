import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../components/Card.jsx';
import { reportService } from '../services/reportService.js';

const colors = ['#17c4d8', '#0879c9', '#16a34a', '#d97706', '#dc2626', '#526276'];

export default function ReportsPage() {
  const report = reportService.management();
  const mainBottleneck = [...report.bottlenecks].sort((a, b) => b.total - a.total)[0]?.name;

  return (
    <div className="content-grid">
      <section className="grid-4">
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

      <section className="grid-2">
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
              <Bar dataKey="horas" fill="#17c4d8" radius={[6, 6, 0, 0]} />
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
            <Bar dataKey="total" fill="#0879c9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
