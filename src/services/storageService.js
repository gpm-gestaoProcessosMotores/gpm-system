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
import { normalizeTechnicalStages } from '../utils/technicalStages.js';
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

const STORAGE_VERSION = '8';

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

let cleaningLinkedRecords = false;

function parseCollection(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function persistCleanCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  pushCollectionToSupabase(key, value);
}

function cleanupLinkedRecords() {
  if (cleaningLinkedRecords) {
    return;
  }

  cleaningLinkedRecords = true;
  try {
    const clients = parseCollection(STORAGE_KEYS.clients);
    const motors = parseCollection(STORAGE_KEYS.motors);
    const orders = parseCollection(STORAGE_KEYS.orders);
    const budgets = parseCollection(STORAGE_KEYS.budgets);
    const history = parseCollection(STORAGE_KEYS.history);

    const validClientIds = new Set(clients.map((client) => client.id));
    const validMotors = motors.filter((motor) => validClientIds.has(motor.clientId));
    const validMotorIds = new Set(validMotors.map((motor) => motor.id));
    const motorById = new Map(validMotors.map((motor) => [motor.id, motor]));
    const validOrders = orders
      .filter((order) => {
        const motor = motorById.get(order.motorId);
        return Boolean(motor && validClientIds.has(order.clientId) && motor.clientId === order.clientId);
      })
      .map((order) => ({ ...order, stages: normalizeTechnicalStages(order.stages) }));
    const validOrderIds = new Set(validOrders.map((order) => order.id));
    const validBudgets = budgets.filter((budget) => !budget.orderId || validOrderIds.has(budget.orderId));
    const validHistory = history.filter((item) => !item.orderId || validOrderIds.has(item.orderId));

    if (validMotors.length !== motors.length) {
      persistCleanCollection(STORAGE_KEYS.motors, validMotors);
    }
    if (JSON.stringify(validOrders) !== JSON.stringify(orders)) {
      persistCleanCollection(STORAGE_KEYS.orders, validOrders);
    }
    if (validBudgets.length !== budgets.length) {
      persistCleanCollection(STORAGE_KEYS.budgets, validBudgets);
    }
    if (validHistory.length !== history.length) {
      persistCleanCollection(STORAGE_KEYS.history, validHistory);
    }
  } finally {
    cleaningLinkedRecords = false;
  }
}

export function initializeStorage() {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.version);
  if (currentVersion !== STORAGE_VERSION) {
    Object.entries(initialCollections).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    localStorage.setItem(STORAGE_KEYS.version, STORAGE_VERSION);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem('gpm_permission_config');
    cleanupLinkedRecords();
    return;
  }

  Object.entries(initialCollections).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
  cleanupLinkedRecords();
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
