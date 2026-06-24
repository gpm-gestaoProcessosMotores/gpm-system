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
      <div className="section-heading">
        <div>
          <p className="eyebrow">Administrativo</p>
          <h2>Orçamentos e aprovações</h2>
        </div>
      </div>

      <section className="vertical-block-stack">
        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 01</span>
              <h3>Ordem de serviço</h3>
            </div>
          </div>
          <Select
            label="OS pronta para orçamento"
            value={form.orderId}
            options={readyOrders.map((order) => ({
              value: order.id,
              label: `${order.number} · ${clients.find((client) => client.id === order.clientId)?.name}`,
            }))}
            onChange={(event) => setForm({ ...form, orderId: event.target.value })}
          />
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 02</span>
              <h3>Base técnica</h3>
              <p>{selectedOrder?.number || 'Selecione uma OS'}</p>
            </div>
          </div>
          {selectedOrder ? (
            <div className="vertical-record-list">
              {stageOrder.map((key) => (
                <article className="vertical-record compact-record" key={key}>
                  <strong>{selectedOrder.stages[key].sector}</strong>
                  <span>{selectedOrder.stages[key].report || 'Sem laudo registrado'}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="checklist-empty">Nenhuma OS pronta para orçamento.</p>
          )}
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 03</span>
              <h3>Composição do orçamento</h3>
            </div>
          </div>
          <div className="form-grid">
            <label className="field vertical-description-field">
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
          </div>
        </Card>

        <Card className="vertical-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 04</span>
              <h3>Resumo e ações</h3>
            </div>
            <StatusBadge status={form.status} />
          </div>
          <div className="budget-total">
            <span>Valor total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
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
        </Card>

        <Card className="vertical-block vertical-history-block" interactive={false}>
          <div className="technical-block-heading">
            <div>
              <span className="technical-block-number">Bloco 05</span>
              <h3>Histórico administrativo</h3>
            </div>
            <span className="technical-block-count">{budgets.length} orçamento(s)</span>
          </div>
          <div className="vertical-record-list">
            {budgets.map((budget) => {
              const order = orders.find((item) => item.id === budget.orderId);
              return (
                <article className="vertical-record" key={budget.id}>
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
                </article>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
