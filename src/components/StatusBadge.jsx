const statusMap = {
  Ativo: 'success',
  Inativo: 'muted',
  Aberta: 'info',
  'Em análise técnica': 'info',
  'Em execução': 'warning',
  'Aguardando orçamento': 'orange',
  'Aguardando aprovação': 'purple',
  Aprovada: 'success',
  Reprovada: 'danger',
  Concluída: 'done',
  'Pronto para orçamento': 'cyan',
  Pendente: 'muted',
  'Em andamento': 'warning',
  Enviado: 'cyan',
  Aprovado: 'success',
  Reprovado: 'danger',
};

export default function StatusBadge({ status }) {
  return <span className={`status status-${statusMap[status] || 'muted'}`}>{status}</span>;
}
