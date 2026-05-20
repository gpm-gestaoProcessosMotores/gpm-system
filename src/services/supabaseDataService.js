import { isSupabaseConfigured, supabase } from './supabaseClient.js';

const collectionByStorageKey = {
  gpm_users: 'users',
  gpm_employees: 'employees',
  gpm_clients: 'clients',
  gpm_motors: 'motors',
  gpm_sectors: 'sectors',
  gpm_orders: 'orders',
  gpm_budgets: 'budgets',
  gpm_history: 'history',
};

export function getCollectionName(storageKey) {
  return collectionByStorageKey[storageKey] || null;
}

export async function pushCollectionToSupabase(storageKey, value) {
  if (!isSupabaseConfigured) {
    return;
  }

  const collection = getCollectionName(storageKey);
  if (!collection || !Array.isArray(value)) {
    return;
  }

  const records = value
    .filter((item) => item?.id)
    .map((item) => ({
      collection,
      record_id: item.id,
      payload: item,
    }));

  try {
    await supabase.rpc('replace_gpm_collection', {
      collection_name: collection,
      records,
    });
  } catch (error) {
    console.warn('Falha ao sincronizar coleção com Supabase:', collection, error);
  }
}

export async function seedSupabaseCollectionsFromLocalStorage(storageKeys) {
  if (!isSupabaseConfigured) {
    return;
  }

  const { data, error } = await supabase.from('gpm_records').select('id').limit(1);
  if (error) {
    console.warn('Falha ao verificar seed do Supabase:', error);
    return;
  }
  if (data?.length) {
    return;
  }

  await Promise.all(
    Object.values(storageKeys)
      .filter((key) => getCollectionName(key))
      .map(async (key) => {
        const rawValue = localStorage.getItem(key);
        const value = rawValue ? JSON.parse(rawValue) : [];
        await pushCollectionToSupabase(key, value);
      }),
  );
}
