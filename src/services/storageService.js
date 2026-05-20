import {
  initialBudgets,
  initialClients,
  initialEmployees,
  initialHistory,
  initialMotors,
  initialOrders,
  initialSectors,
  initialUsers,
} from '../mocks/initialData.js';
import { pushCollectionToSupabase } from './supabaseDataService.js';

export const STORAGE_KEYS = {
  version: 'gpm_storage_version',
  users: 'gpm_users',
  employees: 'gpm_employees',
  clients: 'gpm_clients',
  motors: 'gpm_motors',
  sectors: 'gpm_sectors',
  orders: 'gpm_orders',
  budgets: 'gpm_budgets',
  history: 'gpm_history',
  currentUser: 'gpm_current_user',
};

const STORAGE_VERSION = '5';

const initialCollections = {
  [STORAGE_KEYS.users]: initialUsers,
  [STORAGE_KEYS.employees]: initialEmployees,
  [STORAGE_KEYS.clients]: initialClients,
  [STORAGE_KEYS.motors]: initialMotors,
  [STORAGE_KEYS.sectors]: initialSectors,
  [STORAGE_KEYS.orders]: initialOrders,
  [STORAGE_KEYS.budgets]: initialBudgets,
  [STORAGE_KEYS.history]: initialHistory,
};

export function initializeStorage() {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.version);
  if (currentVersion !== STORAGE_VERSION) {
    Object.entries(initialCollections).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    localStorage.setItem(STORAGE_KEYS.version, STORAGE_VERSION);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }

  Object.entries(initialCollections).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
}

export function readCollection(key) {
  initializeStorage();
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  pushCollectionToSupabase(key, value);
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

export function upsertItem(key, item, prefix) {
  const collection = readCollection(key);
  const nextItem = item.id ? item : { ...item, id: makeId(prefix) };
  const exists = collection.some((current) => current.id === nextItem.id);
  const nextCollection = exists
    ? collection.map((current) => (current.id === nextItem.id ? nextItem : current))
    : [nextItem, ...collection];

  writeCollection(key, nextCollection);
  return nextItem;
}

export function removeItem(key, id) {
  const collection = readCollection(key).filter((item) => item.id !== id);
  writeCollection(key, collection);
}
