const PERMISSION_STORAGE_KEY = 'gpm_permission_config';

export const defaultPermissionItems = [
  { key: 'dashboard', label: 'Dashboard', system: true, route: '/dashboard' },
  { key: 'usuarios', label: 'Usuários', system: true, route: '/usuarios' },
  { key: 'permissoes', label: 'Permissões', system: true, route: '/permissoes' },
  { key: 'setores', label: 'Setores', system: true, route: '/setores' },
  { key: 'funcionarios', label: 'Funcionários', system: true, route: '/funcionarios' },
  { key: 'clientes', label: 'Clientes', system: true, route: '/clientes' },
  { key: 'motores', label: 'Motores', system: true, route: '/motores' },
  { key: 'ordens', label: 'Ordens', system: true, route: '/ordens-servico' },
  { key: 'qrcode', label: 'QR Code', system: true, route: '/qrcode' },
  { key: 'leitor', label: 'Leitor QR', system: true, route: '/leitor-qr' },
  { key: 'tecnico', label: 'Técnico', system: true, route: '/tecnico' },
  { key: 'laudos', label: 'Laudos', system: true, route: '/laudos' },
  { key: 'consolidacao', label: 'Consolidação', system: true, route: '/consolidacao' },
  { key: 'orcamentos', label: 'Orçamento', system: true, route: '/orcamentos' },
  { key: 'pesquisa', label: 'Pesquisa', system: true, route: '/pesquisa' },
  { key: 'relatorios', label: 'Relatórios', system: true, route: '/relatorios' },
  { key: 'historico', label: 'Histórico', system: true, route: '/historico' },
];

export const defaultRoutePermissions = {
  dashboard: ['Administrador', 'Administrativo', 'Gestor'],
  usuarios: ['Administrador'],
  permissoes: ['Administrador'],
  setores: ['Administrador'],
  funcionarios: ['Administrador'],
  clientes: ['Administrador'],
  motores: ['Administrador', 'Administrativo'],
  ordens: ['Administrador', 'Administrativo', 'Gestor'],
  qrcode: ['Administrador'],
  leitor: ['Administrador'],
  tecnico: ['Administrador', 'Técnico'],
  laudos: ['Administrador'],
  consolidacao: ['Administrador', 'Administrativo'],
  orcamentos: ['Administrador', 'Administrativo'],
  pesquisa: ['Administrador', 'Administrativo'],
  relatorios: ['Administrador', 'Gestor'],
  historico: ['Administrador', 'Administrativo', 'Gestor'],
};

export const routePermissions = defaultRoutePermissions;

const routeByPermissionKey = defaultPermissionItems.reduce((routes, item) => {
  if (item.route) {
    routes[item.key] = item.route;
  }
  return routes;
}, {});

function getStoredPermissionConfig() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const rawValue = localStorage.getItem(PERMISSION_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function normalizePermissionConfig(config = {}) {
  const safeConfig = config || {};
  const customItems = Array.isArray(safeConfig.items) ? safeConfig.items.filter((item) => !item.system) : [];
  const customByKey = new Map(customItems.map((item) => [item.key, item]));
  const mergedItems = [
    ...defaultPermissionItems.map((item) => ({ ...item, ...(safeConfig.items || []).find((current) => current.key === item.key) })),
    ...customItems.filter((item) => !defaultPermissionItems.some((defaultItem) => defaultItem.key === item.key)),
  ].map((item) => ({
    key: item.key,
    label: item.label || item.key,
    system: item.system !== false && !customByKey.has(item.key),
    route: item.route || routeByPermissionKey[item.key] || '',
  }));

  const permissions = mergedItems.reduce((nextPermissions, item) => {
    const configuredProfiles = Array.isArray(safeConfig.permissions?.[item.key])
      ? safeConfig.permissions[item.key]
      : defaultRoutePermissions[item.key] || ['Administrador'];
    nextPermissions[item.key] = Array.from(new Set(['Administrador', ...configuredProfiles]));
    return nextPermissions;
  }, {});

  permissions.permissoes = Array.from(new Set(['Administrador', ...(permissions.permissoes || [])]));

  return { items: mergedItems, permissions };
}

export function getPermissionConfig() {
  return normalizePermissionConfig(getStoredPermissionConfig());
}

export function savePermissionConfig(config) {
  const normalizedConfig = normalizePermissionConfig(config);
  localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(normalizedConfig));
  window.dispatchEvent(new CustomEvent('gpm_permissions_updated'));
  return normalizedConfig;
}

export function resetPermissionConfig() {
  localStorage.removeItem(PERMISSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('gpm_permissions_updated'));
  return getPermissionConfig();
}

export function makePermissionKey(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function canAccess(profile, key) {
  if (!profile || !key) {
    return false;
  }

  const permissionConfig = getPermissionConfig();
  return permissionConfig.permissions[key]?.includes(profile);
}

export function getDefaultRoute(profile) {
  const preferredKeys = {
    Administrador: ['dashboard', 'usuarios', 'clientes', 'ordens'],
    Administrativo: ['ordens', 'dashboard', 'motores', 'orcamentos'],
    Técnico: ['tecnico'],
    Gestor: ['dashboard', 'relatorios', 'ordens', 'historico'],
  };

  const preferredRoute = (preferredKeys[profile] || []).find((key) => canAccess(profile, key));
  if (preferredRoute) {
    return routeByPermissionKey[preferredRoute];
  }

  const firstAllowedItem = getPermissionConfig().items.find((item) => item.route && canAccess(profile, item.key));
  return firstAllowedItem?.route || '/login';
}
