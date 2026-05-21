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

function normalizeIdentifier(identifier) {
  return String(identifier || '').trim().toLowerCase();
}

function findLocalUserByCredentials(identifier, password) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const users = readCollection(STORAGE_KEYS.users);

  return users.find((current) => {
    const emailMatches = current.email?.toLowerCase() === normalizedIdentifier;
    const loginMatches = current.login?.toLowerCase() === normalizedIdentifier;
    const nameMatches = current.name?.toLowerCase() === normalizedIdentifier;
    return (emailMatches || loginMatches || nameMatches) && current.password === password && current.status === 'Ativo';
  });
}

function findActiveLocalUserForSupabase(profile, authEmail) {
  const identityValues = [profile?.email, authEmail, profile?.login, profile?.name]
    .filter(Boolean)
    .map((value) => normalizeIdentifier(value));
  const users = readCollection(STORAGE_KEYS.users);

  return users.find((current) => {
    if (current.status !== 'Ativo') {
      return false;
    }

    return [current.email, current.login, current.name].some((value) => identityValues.includes(normalizeIdentifier(value)));
  });
}

function updateLocalLastAccess(userId, lastAccess) {
  const users = readCollection(STORAGE_KEYS.users);
  const nextUsers = users.map((current) => (current.id === userId ? { ...current, lastAccess } : current));
  writeCollection(STORAGE_KEYS.users, nextUsers);
  return nextUsers.find((current) => current.id === userId);
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
  const normalizedIdentifier = normalizeIdentifier(identifier);
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

  const localUser = findActiveLocalUserForSupabase(profile, authData.user.email);
  if (!localUser) {
    await supabase.auth.signOut();
    return null;
  }

  const lastAccess = new Date().toISOString();
  await supabase.from('user_profiles').update({ last_access: lastAccess }).eq('id', profile.id);
  const updatedLocalUser = updateLocalLastAccess(localUser.id, lastAccess);
  await seedSupabaseCollectionsFromLocalStorage(STORAGE_KEYS);

  return normalizeAuthUser({
    ...updatedLocalUser,
    authUserId: authData.user.id,
    lastAccess,
    source: 'supabase',
  });
}

function loginWithLocalStorage(identifier, password) {
  const user = findLocalUserByCredentials(identifier, password);

  if (!user) {
    return null;
  }

  const lastAccess = new Date().toISOString();
  updateLocalLastAccess(user.id, lastAccess);

  return normalizeAuthUser({ ...user, lastAccess, source: 'localStorage' });
}

export async function login(credentialsOrIdentifier, passwordArg) {
  const identifier = typeof credentialsOrIdentifier === 'object' ? credentialsOrIdentifier.identifier : credentialsOrIdentifier;
  const password = typeof credentialsOrIdentifier === 'object' ? credentialsOrIdentifier.password : passwordArg;

  if (isSupabaseConfigured) {
    const supabaseUser = await loginWithSupabase(identifier, password);
    if (supabaseUser) {
      return supabaseUser;
    }
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
