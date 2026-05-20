import { STORAGE_KEYS, readCollection, writeCollection } from './storageService.js';
import { seedSupabaseCollectionsFromLocalStorage } from './supabaseDataService.js';
import { isSupabaseConfigured, supabase } from './supabaseClient.js';

function normalizeAuthUser(user) {
  if (!user) {
    return null;
  }

  const safeUser = { ...user };
  delete safeUser.password;
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(safeUser));
  return safeUser;
}

async function resolveSupabaseEmail(identifier) {
  if (identifier.includes('@')) {
    return identifier;
  }

  const { data, error } = await supabase.rpc('resolve_login_email', {
    login_text: identifier,
  });

  if (error || !data) {
    return identifier;
  }

  return data;
}

async function loginWithSupabase(identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const email = await resolveSupabaseEmail(normalizedIdentifier);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single();

  if (profileError || !profile || profile.status !== 'Ativo') {
    await supabase.auth.signOut();
    return null;
  }

  const lastAccess = new Date().toISOString();
  await supabase.from('user_profiles').update({ last_access: lastAccess }).eq('id', profile.id);
  await seedSupabaseCollectionsFromLocalStorage(STORAGE_KEYS);

  return normalizeAuthUser({
    id: profile.id,
    authUserId: authData.user.id,
    name: profile.name,
    email: profile.email || authData.user.email,
    login: profile.login,
    profile: profile.profile,
    sector: profile.sector || '',
    linkedEmployeeId: profile.linked_employee_id || '',
    linkedClientId: profile.linked_client_id || '',
    status: profile.status,
    lastAccess,
    source: 'supabase',
  });
}

function loginWithLocalStorage(identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const users = readCollection(STORAGE_KEYS.users);
  const user = users.find((current) => {
    const emailMatches = current.email?.toLowerCase() === normalizedIdentifier;
    const loginMatches = current.login?.toLowerCase() === normalizedIdentifier;
    const nameMatches = current.name.toLowerCase() === normalizedIdentifier;
    return (emailMatches || loginMatches || nameMatches) && current.password === password && current.status === 'Ativo';
  });

  if (!user) {
    return null;
  }

  const lastAccess = new Date().toISOString();
  writeCollection(
    STORAGE_KEYS.users,
    users.map((current) => (current.id === user.id ? { ...current, lastAccess } : current)),
  );

  return normalizeAuthUser({ ...user, lastAccess, source: 'localStorage' });
}

export async function login(credentialsOrIdentifier, passwordArg) {
  const identifier = typeof credentialsOrIdentifier === 'object' ? credentialsOrIdentifier.identifier : credentialsOrIdentifier;
  const password = typeof credentialsOrIdentifier === 'object' ? credentialsOrIdentifier.password : passwordArg;

  if (isSupabaseConfigured) {
    return loginWithSupabase(identifier, password);
  }

  return loginWithLocalStorage(identifier, password);
}

export async function logout() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function getCurrentUser() {
  const rawUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  return rawUser ? JSON.parse(rawUser) : null;
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}
