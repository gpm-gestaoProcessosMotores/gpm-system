import { STORAGE_KEYS, makeId, readCollection, writeCollection } from './storageService.js';

export const historyService = {
  list: () => readCollection(STORAGE_KEYS.history),
  add: ({ orderId, user, action, detail }) => {
    const item = {
      id: makeId('his'),
      orderId,
      user,
      action,
      detail,
      createdAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.history, [item, ...readCollection(STORAGE_KEYS.history)]);
    return item;
  },
};
