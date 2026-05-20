import { STORAGE_KEYS, makeId, readCollection, removeItem, upsertItem, writeCollection } from './storageService.js';
import { historyService } from './historyService.js';
import { formatOSCode } from '../utils/validators.js';

export const stageOrder = ['mecanica', 'usinagem', 'eletrica'];

const checklists = {
  mecanica: [
    { label: 'Rolamentos verificados', done: false },
    { label: 'Tampas verificadas', done: false },
    { label: 'Eixo verificado', done: false },
    { label: 'Carcaça verificada', done: false },
    { label: 'Ventilação verificada', done: false },
    { label: 'Acoplamento verificado', done: false },
    { label: 'Necessita troca de peças?', done: false },
  ],
  usinagem: [
    { label: 'Eixo necessita usinagem?', done: false },
    { label: 'Carcaça necessita ajuste?', done: false },
    { label: 'Tampas precisam de recuperação?', done: false },
    { label: 'Medidas conferidas?', done: false },
    { label: 'Peças recuperadas?', done: false },
    { label: 'Serviço de torno/fresa necessário?', done: false },
  ],
  eletrica: [
    { label: 'Bobinagem verificada', done: false },
    { label: 'Isolamento testado', done: false },
    { label: 'Resistência medida', done: false },
    { label: 'Cabos verificados', done: false },
    { label: 'Ligação conferida', done: false },
    { label: 'Teste elétrico realizado', done: false },
    { label: 'Necessita rebobinamento?', done: false },
  ],
};

const stageTemplates = {
  mecanica: {
    sector: 'Mecânica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: checklists.mecanica,
    attachments: [],
  },
  usinagem: {
    sector: 'Usinagem',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: checklists.usinagem,
    attachments: [],
  },
  eletrica: {
    sector: 'Elétrica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: checklists.eletrica,
    attachments: [],
  },
};

function getStageKeyBySector(sector) {
  const map = {
    Mecânica: 'mecanica',
    Usinagem: 'usinagem',
    Elétrica: 'eletrica',
  };
  return map[sector];
}

function buildOrderNumber() {
  const next = readCollection(STORAGE_KEYS.orders).length + 1;
  return `OS${String(next).padStart(4, '0')}`;
}

function getNextSector(stages) {
  const currentKey = stageOrder.find((key) => stages[key].status !== 'Concluída');
  return currentKey ? stages[currentKey].sector : 'Administrativo';
}

export const osService = {
  list: () => readCollection(STORAGE_KEYS.orders),
  getOrders: () => readCollection(STORAGE_KEYS.orders),
  findById: (id) => readCollection(STORAGE_KEYS.orders).find((order) => order.id === id),
  getOrdersByCurrentSector: (sector) => readCollection(STORAGE_KEYS.orders).filter((order) => order.currentSector === sector),
  getOrderByCode: (code) => readCollection(STORAGE_KEYS.orders).find((order) => formatOSCode(order.number) === formatOSCode(code)),
  getOrdersByClient: (clientId) => readCollection(STORAGE_KEYS.orders).filter((order) => order.clientId === clientId),
  getClientOrderStatus: (clientId, osCode) => {
    const order = osService.getOrderByCode(osCode);
    if (!order || order.clientId !== clientId) {
      return null;
    }
    return order;
  },
  getVisibleOrdersForUser: (user) => {
    const orders = readCollection(STORAGE_KEYS.orders);
    if (!user) {
      return [];
    }
    if (user.profile === 'Cliente') {
      return orders.filter((order) => order.clientId === user.linkedClientId);
    }
    if (user.profile?.startsWith('Técnico')) {
      const stageKey = getStageKeyBySector(user.sector);
      return orders.filter((order) => order.currentSector === user.sector || order.stages?.[stageKey]?.status !== 'Pendente');
    }
    return orders;
  },
  remove: (id) => removeItem(STORAGE_KEYS.orders, id),
  save: (order, actor = 'Sistema') => {
    const isNew = !order.id;
    const nextOrder = isNew
      ? {
          ...order,
          id: makeId('os'),
          number: buildOrderNumber(),
          status: 'Aberta',
          currentSector: 'Mecânica',
          openedAt: new Date().toISOString(),
          stages: JSON.parse(JSON.stringify(stageTemplates)),
        }
      : order;
    const saved = upsertItem(STORAGE_KEYS.orders, nextOrder, 'os');

    if (isNew) {
      historyService.add({
        orderId: saved.id,
        user: actor,
        action: 'criou a OS',
        detail: `${saved.number} registrada para análise técnica.`,
      });
    }

    return saved;
  },
  updateStage: (orderId, stageKey, stageData, actor = 'Sistema', action = 'atualizou etapa') => {
    const orders = readCollection(STORAGE_KEYS.orders);
    let updatedOrder;

    const nextOrders = orders.map((order) => {
      if (order.id !== orderId) {
        return order;
      }

      const stages = {
        ...order.stages,
        [stageKey]: {
          ...order.stages[stageKey],
          ...stageData,
        },
      };
      const allDone = stageOrder.every((key) => stages[key].status === 'Concluída');
      updatedOrder = {
        ...order,
        stages,
        currentSector: getNextSector(stages),
        status: allDone ? 'Aguardando orçamento' : 'Em análise técnica',
      };
      return updatedOrder;
    });

    writeCollection(STORAGE_KEYS.orders, nextOrders);

    if (updatedOrder) {
      historyService.add({
        orderId,
        user: actor,
        action,
        detail: `${updatedOrder.stages[stageKey].sector}: ${stageData.status || 'dados registrados'}.`,
      });
    }

    return updatedOrder;
  },
  updateStatus: (orderId, status, actor = 'Sistema') => {
    const orders = readCollection(STORAGE_KEYS.orders);
    const nextOrders = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
    writeCollection(STORAGE_KEYS.orders, nextOrders);
    historyService.add({
      orderId,
      user: actor,
      action: 'alterou status',
      detail: `Status atualizado para ${status}.`,
    });
    return nextOrders.find((order) => order.id === orderId);
  },
};
