import { readCollection, STORAGE_KEYS } from './storageService.js';
import { stageOrder } from './osService.js';

export const reportService = {
  dashboard: () => {
    const orders = readCollection(STORAGE_KEYS.orders);
    const byStatus = (status) => orders.filter((order) => order.status === status).length;

    return {
      open: byStatus('Aberta'),
      inProgress: byStatus('Em análise técnica'),
      waitingBudget: byStatus('Aguardando orçamento'),
      done: byStatus('Concluída'),
      averageStageTime: '4h 20min',
      recentOrders: orders.slice(0, 5),
    };
  },
  management: () => {
    const orders = readCollection(STORAGE_KEYS.orders);
    const statuses = [...new Set(orders.map((order) => order.status))].map((status) => ({
      name: status,
      total: orders.filter((order) => order.status === status).length,
    }));
    const sectorTimes = [
      { name: 'Mecânica', horas: 3.8 },
      { name: 'Usinagem', horas: 4.5 },
      { name: 'Elétrica', horas: 5.2 },
    ];
    const bottlenecks = stageOrder.map((key) => {
      const pending = orders.filter((order) => order.stages[key]?.status !== 'Concluída').length;
      return { name: orders[0]?.stages[key]?.sector || key, total: pending };
    });

    return {
      statuses,
      sectorTimes,
      completedThisMonth: orders.filter((order) => order.status === 'Concluída').length,
      bottlenecks,
    };
  },
};
