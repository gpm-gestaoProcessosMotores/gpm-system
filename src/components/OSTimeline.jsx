import { CheckCircle2, Circle } from 'lucide-react';

const flow = [
  'OS aberta',
  'Em análise técnica',
  'Mecânica',
  'Usinagem',
  'Elétrica',
  'Aguardando orçamento',
  'Aguardando aprovação',
  'Em execução',
  'Concluída',
];

function getCurrentIndex(order) {
  if (!order) {
    return 0;
  }

  if (order.status === 'Concluída') return flow.indexOf('Concluída');
  if (order.status === 'Aguardando aprovação') return flow.indexOf('Aguardando aprovação');
  if (order.status === 'Aguardando orçamento') return flow.indexOf('Aguardando orçamento');
  if (order.status === 'Aprovada') return flow.indexOf('Em execução');
  if (order.currentSector === 'Elétrica') return flow.indexOf('Elétrica');
  if (order.currentSector === 'Usinagem') return flow.indexOf('Usinagem');
  if (order.currentSector === 'Mecânica') return flow.indexOf('Mecânica');
  if (order.status === 'Em análise técnica') return flow.indexOf('Em análise técnica');
  return flow.indexOf('OS aberta');
}

export default function OSTimeline({ order }) {
  const currentIndex = getCurrentIndex(order);

  return (
    <div className="os-timeline">
      {flow.map((item, index) => {
        const done = index <= currentIndex;
        return (
          <div className={`os-timeline-step ${done ? 'is-done' : ''}`} key={item}>
            {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
}
