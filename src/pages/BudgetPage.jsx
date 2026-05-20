import { CheckCircle2, Send, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { budgetService } from '../services/budgetService.js';
import { clientService } from '../services/clientService.js';
import { osService, stageOrder } from '../services/osService.js';
import { formatCurrency } from '../utils/formatters.js';

const emptyBudget = {
  orderId: '',
  serviceDescription: '',
  parts: 0,
  labor: 0,
  deadline: '7 dias úteis',
  status: 'Rascunho',
};

export default function BudgetPage() {
  const { user } = useAuth();
  const clients = clientService.list();
  const [orders, setOrders] = useState(osService.list());
  const [budgets, setBudgets] = useState(budgetService.list());
  const readyOrders = orders.filter((order) => stageOrder.every((key) => order.stages[key].status === 'Concluída'));
  const [form, setForm] = useState({ ...emptyBudget, orderId: readyOrders[0]?.id || '' });
  const selectedOrder = useMemo(() => orders.find((order) => order.id === form.orderId), [orders, form.orderId]);
  const total = Number(form.parts || 0) + Number(form.labor || 0);
  const hasReadyOrder = Boolean(form.orderId);

  useEffect(() => {
    const existing = budgets.find((budget) => budget.orderId === form.orderId);
    if (existing) {
      setForm(existing);
    } else {
      setForm((current) => ({ ...emptyBudget, orderId: current.orderId || readyOrders[0]?.id || '' }));
    }
  }, [form.orderId]);

  function refresh() {
    setOrders(osService.list());
    setBudgets(budgetService.list());
  }

  function saveBudget(status) {
    const saved = status
      ? budgetService.setStatus({ ...form, status }, status, user?.name)
      : budgetService.save(form, user?.name);
    setForm(saved);
    refresh();
  }

  return (
    <div className="content-grid">
      <section className="grid-2">
        <Card className="stage-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Composição</p>
              <h2>Orçamento</h2>
            </div>
          </div>

          <div className="form-grid">
            <Select
              label="Ordem de Serviço"
              value={form.orderId}
              options={readyOrders.map((order) => ({
                value: order.id,
                label: `${order.number} · ${clients.find((client) => client.id === order.clientId)?.name}`,
              }))}
              onChange={(event) => setForm({ ...form, orderId: event.target.value })}
            />
            <label className="field">
              <span>Descrição do serviço</span>
              <textarea
                value={form.serviceDescription}
                onChange={(event) => setForm({ ...form, serviceDescription: event.target.value })}
              />
            </label>
            <div className="grid-2">
              <Input
                label="Peças"
                type="number"
                min="0"
                value={form.parts}
                onChange={(event) => setForm({ ...form, parts: event.target.value })}
              />
              <Input
                label="Mão de obra"
                type="number"
                min="0"
                value={form.labor}
                onChange={(event) => setForm({ ...form, labor: event.target.value })}
              />
            </div>
            <Input label="Prazo" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
            <Card className="metric-card">
              <span>Valor total</span>
              <strong>{formatCurrency(total)}</strong>
            </Card>
            <div className="row-actions">
              <Button icon={Send} disabled={!hasReadyOrder} onClick={() => saveBudget('Enviado')}>
                Enviar orçamento
              </Button>
              <Button variant="secondary" icon={CheckCircle2} disabled={!hasReadyOrder} onClick={() => saveBudget('Aprovado')}>
                Aprovar
              </Button>
              <Button variant="danger" icon={XCircle} disabled={!hasReadyOrder} onClick={() => saveBudget('Reprovado')}>
                Reprovar
              </Button>
            </div>
          </div>
        </Card>

        <Card className="stage-card">
          <p className="eyebrow">Base técnica</p>
          <h2>{selectedOrder?.number || 'Selecione uma OS'}</h2>
          {selectedOrder ? (
            stageOrder.map((key) => (
              <div className="upload-drop" key={key}>
                <strong>{selectedOrder.stages[key].sector}</strong>
                <span>{selectedOrder.stages[key].report || 'Sem laudo registrado'}</span>
              </div>
            ))
          ) : (
            <p className="muted">Nenhuma OS pronta para orçamento.</p>
          )}
        </Card>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Orçamentos</p>
            <h2>Histórico administrativo</h2>
          </div>
        </div>
        <div className="grid-3">
          {budgets.map((budget) => {
            const order = orders.find((item) => item.id === budget.orderId);
            return (
              <Card className="stage-card" key={budget.id}>
                <div className="stage-header">
                  <h3>{order?.number}</h3>
                  <StatusBadge status={budget.status} />
                </div>
                <p>{budget.serviceDescription}</p>
                <div className="meta-grid">
                  <span>Peças: {formatCurrency(budget.parts)}</span>
                  <span>Mão de obra: {formatCurrency(budget.labor)}</span>
                  <span>Total: {formatCurrency(budget.total)}</span>
                  <span>Prazo: {budget.deadline}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
