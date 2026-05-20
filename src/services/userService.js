import { STORAGE_KEYS, readCollection, removeItem, upsertItem, writeCollection } from './storageService.js';

export const userService = {
  list: () => readCollection(STORAGE_KEYS.users),
  getUsers: () => readCollection(STORAGE_KEYS.users),
  save: (user) => upsertItem(STORAGE_KEYS.users, user, 'usr'),
  createUser: (data) => upsertItem(STORAGE_KEYS.users, data, 'usr'),
  updateUser: (id, data) => upsertItem(STORAGE_KEYS.users, { ...data, id }, 'usr'),
  remove: (id) => removeItem(STORAGE_KEYS.users, id),
  deactivateUser: (id) => {
    const users = readCollection(STORAGE_KEYS.users).map((user) => (user.id === id ? { ...user, status: 'Inativo' } : user));
    writeCollection(STORAGE_KEYS.users, users);
    return users;
  },
  resetPassword: (id, newPassword) => {
    const users = readCollection(STORAGE_KEYS.users).map((user) => (user.id === id ? { ...user, password: newPassword } : user));
    writeCollection(STORAGE_KEYS.users, users);
    return users.find((user) => user.id === id);
  },
  toggleStatus: (id) => {
    const users = readCollection(STORAGE_KEYS.users).map((user) =>
      user.id === id ? { ...user, status: user.status === 'Ativo' ? 'Inativo' : 'Ativo' } : user,
    );
    writeCollection(STORAGE_KEYS.users, users);
    return users;
  },
};
