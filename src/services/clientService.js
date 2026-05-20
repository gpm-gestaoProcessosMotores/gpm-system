import { STORAGE_KEYS, makeId, readCollection, removeItem, upsertItem, writeCollection } from './storageService.js';

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
  remove: (id) => removeItem(STORAGE_KEYS.clients, id),
  findById: (id) => readCollection(STORAGE_KEYS.clients).find((client) => client.id === id),
  createClientAccess: (clientId, accessData) => {
    const clients = readCollection(STORAGE_KEYS.clients);
    const client = clients.find((current) => current.id === clientId);
    if (!client) {
      throw new Error('Cliente não encontrado.');
    }

    const users = readCollection(STORAGE_KEYS.users);
    const existingUser = users.find((user) => user.linkedClientId === clientId);
    const user = {
      ...(existingUser || {}),
      id: existingUser?.id || makeId('usr'),
      name: accessData.name || client.name,
      email: accessData.email || client.email,
      login: accessData.login || accessData.email || client.email,
      password: accessData.password,
      profile: 'Cliente',
      sector: '',
      linkedClientId: clientId,
      linkedEmployeeId: '',
      status: accessData.status || 'Ativo',
      lastAccess: existingUser?.lastAccess || '',
    };

    writeCollection(
      STORAGE_KEYS.users,
      existingUser ? users.map((current) => (current.id === user.id ? user : current)) : [user, ...users],
    );

    writeCollection(
      STORAGE_KEYS.clients,
      clients.map((current) =>
        current.id === clientId ? { ...current, allowLogin: true, userId: user.id, address: buildAddress(current) } : current,
      ),
    );

    return user;
  },
};
