import { STORAGE_KEYS, readCollection, upsertItem, writeCollection } from './storageService.js';

function buildAddress(client) {
  const line = [client.street, client.number].filter(Boolean).join(', ');
  const district = client.neighborhood ? ` - ${client.neighborhood}` : '';
  const city = client.city && client.state ? ` - ${client.city}/${client.state}` : '';
  return `${line}${district}${city}`.trim() || client.address || '';
}

export const clientService = {
  list: () => readCollection(STORAGE_KEYS.clients),
  getClients: () => readCollection(STORAGE_KEYS.clients),
  save: (client) => upsertItem(STORAGE_KEYS.clients, { ...client, address: buildAddress(client) }, 'cli'),
  createClient: (data) => upsertItem(STORAGE_KEYS.clients, { ...data, address: buildAddress(data) }, 'cli'),
  updateClient: (id, data) => upsertItem(STORAGE_KEYS.clients, { ...data, id, address: buildAddress(data) }, 'cli'),
  remove: (id) => {
    const motors = readCollection(STORAGE_KEYS.motors);
    const removedMotorIds = new Set(motors.filter((motor) => motor.clientId === id).map((motor) => motor.id));
    const orders = readCollection(STORAGE_KEYS.orders);
    const removedOrderIds = new Set(
      orders.filter((order) => order.clientId === id || removedMotorIds.has(order.motorId)).map((order) => order.id),
    );

    writeCollection(
      STORAGE_KEYS.clients,
      readCollection(STORAGE_KEYS.clients).filter((client) => client.id !== id),
    );
    writeCollection(
      STORAGE_KEYS.motors,
      motors.filter((motor) => motor.clientId !== id),
    );
    writeCollection(
      STORAGE_KEYS.orders,
      orders.filter((order) => !removedOrderIds.has(order.id)),
    );
    writeCollection(
      STORAGE_KEYS.budgets,
      readCollection(STORAGE_KEYS.budgets).filter((budget) => !removedOrderIds.has(budget.orderId)),
    );
    writeCollection(
      STORAGE_KEYS.history,
      readCollection(STORAGE_KEYS.history).filter((item) => !removedOrderIds.has(item.orderId)),
    );
    writeCollection(
      STORAGE_KEYS.users,
      readCollection(STORAGE_KEYS.users).filter((user) => user.linkedClientId !== id),
    );
  },
  findById: (id) => readCollection(STORAGE_KEYS.clients).find((client) => client.id === id),
};
