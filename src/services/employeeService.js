import { STORAGE_KEYS, readCollection, removeItem, upsertItem, writeCollection } from './storageService.js';

export const employeeService = {
  list: () => readCollection(STORAGE_KEYS.employees),
  save: (employee) => upsertItem(STORAGE_KEYS.employees, employee, 'emp'),
  remove: (id) => removeItem(STORAGE_KEYS.employees, id),
  toggleStatus: (id) => {
    const employees = readCollection(STORAGE_KEYS.employees).map((employee) =>
      employee.id === id ? { ...employee, status: employee.status === 'Ativo' ? 'Inativo' : 'Ativo' } : employee,
    );
    writeCollection(STORAGE_KEYS.employees, employees);
    return employees;
  },
};
