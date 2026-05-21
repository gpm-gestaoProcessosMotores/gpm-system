import { STORAGE_KEYS, makeId, readCollection, removeItem, upsertItem, writeCollection } from './storageService.js';
import { historyService } from './historyService.js';
import { formatOSCode } from '../utils/validators.js';
import { getTechnicalSectorByProfile, normalizeTechnicalStages, stageOrder, stageTemplates } from '../utils/technicalStages.js';

export { stageOrder };

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

function getValidOrders() {
  const clients = readCollection(STORAGE_KEYS.clients);
  const motors = readCollection(STORAGE_KEYS.motors);
  const validClientIds = new Set(clients.map((client) => client.id));
  const motorById = new Map(motors.map((motor) => [motor.id, motor]));

  return readCollection(STORAGE_KEYS.orders)
    .filter((order) => {
      const motor = motorById.get(order.motorId);
      return Boolean(motor && validClientIds.has(order.clientId) && motor.clientId === order.clientId);
    })
    .map((order) => ({ ...order, stages: normalizeTechnicalStages(order.stages) }));
}

export const osService = {
  list: () => getValidOrders(),
  getOrders: () => getValidOrders(),
  findById: (id) => getValidOrders().find((order) => order.id === id),
  getOrdersByCurrentSector: (sector) => getValidOrders().filter((order) => order.currentSector === sector),
  getOrderByCode: (code) => getValidOrders().find((order) => formatOSCode(order.number) === formatOSCode(code)),
  getOrdersByClient: (clientId) => getValidOrders().filter((order) => order.clientId === clientId),
  getClientOrderStatus: (clientId, osCode) => {
    const order = osService.getOrderByCode(osCode);
    if (!order || order.clientId !== clientId) {
      return null;
    }
    return order;
  },
  getVisibleOrdersForUser: (user) => {
    const orders = getValidOrders();
    if (!user) {
      return [];
    }
    if (user.profile === 'Cliente') {
      return orders.filter((order) => order.clientId === user.linkedClientId);
    }
    if (user.profile?.startsWith('Técnico')) {
      const userSector = getTechnicalSectorByProfile(user.profile, user.sector);
      const stageKey = getStageKeyBySector(userSector);
      return orders.filter((order) => order.currentSector === userSector || order.stages?.[stageKey]?.status !== 'Pendente');
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
      const normalizedStages = normalizeTechnicalStages(stages);
      const allDone = stageOrder.every((key) => normalizedStages[key].status === 'Concluída');
      updatedOrder = {
        ...order,
        stages: normalizedStages,
        currentSector: getNextSector(normalizedStages),
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
