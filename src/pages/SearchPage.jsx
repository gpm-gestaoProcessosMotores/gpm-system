import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import OSCard from '../components/OSCard.jsx';
import Select from '../components/Select.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService } from '../services/osService.js';
import { normalizeText } from '../utils/formatters.js';

const statuses = [
  'Todos',
  'Aberta',
  'Em análise técnica',
  'Aguardando orçamento',
  'Aguardando aprovação',
  'Aprovada',
  'Reprovada',
  'Concluída',
];

export default function SearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orders = osService.getVisibleOrdersForUser(user);
  const clients = clientService.list();
  const motors = motorService.list();
  const [filters, setFilters] = useState({
    term: searchParams.get('busca') || '',
    number: '',
    client: '',
    status: 'Todos',
    sector: 'Todos',
    date: '',
  });

  useEffect(() => {
    setFilters((current) => ({ ...current, term: searchParams.get('busca') || '' }));
  }, [searchParams]);

  const results = useMemo(
    () =>
      orders.filter((order) => {
        const client = clients.find((item) => item.id === order.clientId);
        const motor = motors.find((item) => item.id === order.motorId);
        const generalFields = [
          order.number,
          order.status,
          order.currentSector,
          order.summary,
          client?.name,
          client?.document,
          client?.email,
          motor?.identification,
          motor?.internalCode,
          motor?.brand,
          motor?.model,
          motor?.serialNumber,
          motor?.reportedDefect,
        ];
        const termMatches =
          !filters.term.trim() || generalFields.some((field) => normalizeText(field).includes(normalizeText(filters.term)));
        const numberMatches = normalizeText(order.number).includes(normalizeText(filters.number));
        const clientMatches = normalizeText(client?.name).includes(normalizeText(filters.client));
        const statusMatches = filters.status === 'Todos' || order.status === filters.status;
        const sectorMatches = filters.sector === 'Todos' || order.currentSector === filters.sector;
        const dateMatches = !filters.date || order.openedAt.startsWith(filters.date);
        return termMatches && numberMatches && clientMatches && statusMatches && sectorMatches && dateMatches;
      }),
    [orders, clients, motors, filters],
  );

  return (
    <div className="content-grid">
      <Card className="stage-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Consulta</p>
            <h2>Pesquisar OS</h2>
          </div>
        </div>
        <form className="form-grid two" onSubmit={(event) => event.preventDefault()}>
          <Input
            label="Busca geral"
            value={filters.term}
            placeholder="Digite OS, cliente, documento, marca, modelo ou código do motor"
            onChange={(event) => setFilters({ ...filters, term: event.target.value })}
          />
          <Input
            label="Número da OS"
            value={filters.number}
            onChange={(event) => setFilters({ ...filters, number: event.target.value })}
          />
          <Input
            label="Cliente"
            value={filters.client}
            onChange={(event) => setFilters({ ...filters, client: event.target.value })}
          />
          <Select
            label="Status"
            value={filters.status}
            options={statuses}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          />
          <Select
            label="Setor"
            value={filters.sector}
            options={['Todos', 'Mecânica', 'Usinagem', 'Elétrica', 'Administrativo', 'Expedição']}
            onChange={(event) => setFilters({ ...filters, sector: event.target.value })}
          />
          <Input label="Data" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <div className="form-actions">
            <Button type="submit" icon={Search}>Pesquisar</Button>
          </div>
        </form>
      </Card>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{results.length} resultado(s)</p>
            <h2>Ordens encontradas</h2>
          </div>
        </div>
        <div className="grid-2">
          {results.map((order) => (
            <OSCard
              key={order.id}
              order={order}
              client={clients.find((client) => client.id === order.clientId)}
              motor={motors.find((motor) => motor.id === order.motorId)}
            />
          ))}
          {!results.length ? (
            <Card className="stage-card">
              <h3>Nenhum resultado encontrado</h3>
              <p className="muted">Tente buscar por número da OS, nome do cliente, documento, marca, modelo ou código do motor.</p>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
