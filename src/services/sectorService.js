import { STORAGE_KEYS, readCollection, upsertItem, writeCollection } from './storageService.js';

export const sectorService = {
  list: () => readCollection(STORAGE_KEYS.sectors),
  save: (sector) => upsertItem(STORAGE_KEYS.sectors, sector, 'set'),
  toggleStatus: (id) => {
    const sectors = readCollection(STORAGE_KEYS.sectors).map((sector) =>
      sector.id === id ? { ...sector, status: sector.status === 'Ativo' ? 'Inativo' : 'Ativo' } : sector,
    );
    writeCollection(STORAGE_KEYS.sectors, sectors);
    return sectors;
  },
};
