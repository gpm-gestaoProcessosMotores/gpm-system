import { STORAGE_KEYS, readCollection, upsertItem, writeCollection } from './storageService.js';

export const motorService = {
  list: () => readCollection(STORAGE_KEYS.motors),
  save: (motor) => upsertItem(STORAGE_KEYS.motors, motor, 'mot'),
  getLinkedOrders: (id) => readCollection(STORAGE_KEYS.orders).filter((order) => order.motorId === id),
  remove: (id) => {
    const orders = readCollection(STORAGE_KEYS.orders);
    const linkedOrderIds = new Set(orders.filter((order) => order.motorId === id).map((order) => order.id));
    const nextOrders = orders.filter((order) => !linkedOrderIds.has(order.id));

    writeCollection(
      STORAGE_KEYS.motors,
      readCollection(STORAGE_KEYS.motors).filter((motor) => motor.id !== id),
    );

    if (linkedOrderIds.size) {
      writeCollection(STORAGE_KEYS.orders, nextOrders);
      writeCollection(
        STORAGE_KEYS.budgets,
        readCollection(STORAGE_KEYS.budgets).filter((budget) => !linkedOrderIds.has(budget.orderId)),
      );
      writeCollection(
        STORAGE_KEYS.history,
        readCollection(STORAGE_KEYS.history).filter((item) => !linkedOrderIds.has(item.orderId)),
      );
    }

    return { removedOrdersCount: linkedOrderIds.size };
  },
  findById: (id) => readCollection(STORAGE_KEYS.motors).find((motor) => motor.id === id),
};
