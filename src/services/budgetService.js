import { STORAGE_KEYS, readCollection, upsertItem } from './storageService.js';
import { historyService } from './historyService.js';
import { osService } from './osService.js';

export const budgetService = {
  list: () => readCollection(STORAGE_KEYS.budgets),
  save: (budget, actor = 'Administrativo') => {
    const total = Number(budget.parts || 0) + Number(budget.labor || 0);
    const saved = upsertItem(STORAGE_KEYS.budgets, { ...budget, total }, 'bud');
    historyService.add({
      orderId: saved.orderId,
      user: actor,
      action: 'gerou orçamento',
      detail: `Orçamento ${saved.status || 'rascunho'} no valor de R$ ${total.toLocaleString('pt-BR')}.`,
    });
    return saved;
  },
  setStatus: (budget, status, actor = 'Administrativo') => {
    const saved = budgetService.save({ ...budget, status }, actor);
    const orderStatusByBudget = {
      Enviado: 'Aguardando aprovação',
      Aprovado: 'Aprovada',
      Reprovado: 'Reprovada',
    };
    if (orderStatusByBudget[status]) {
      osService.updateStatus(saved.orderId, orderStatusByBudget[status], actor);
    }
    return saved;
  },
};
