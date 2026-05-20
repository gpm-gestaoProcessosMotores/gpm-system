import { STORAGE_KEYS, readCollection, removeItem, upsertItem } from './storageService.js';

export const motorService = {
  list: () => readCollection(STORAGE_KEYS.motors),
  save: (motor) => upsertItem(STORAGE_KEYS.motors, motor, 'mot'),
  remove: (id) => removeItem(STORAGE_KEYS.motors, id),
  findById: (id) => readCollection(STORAGE_KEYS.motors).find((motor) => motor.id === id),
};
