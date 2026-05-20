export const routePermissions = {
  dashboard: ['Administrador', 'Administrativo', 'Gestor'],
  usuarios: ['Administrador'],
  permissoes: ['Administrador'],
  setores: ['Administrador'],
  funcionarios: ['Administrador'],
  clientes: ['Administrador', 'Administrativo'],
  motores: ['Administrador', 'Administrativo'],
  ordens: ['Administrador', 'Administrativo', 'Gestor'],
  qrcode: ['Administrador'],
  leitor: ['Administrador'],
  fluxo: ['Administrador'],
  mecanica: ['Administrador', 'Técnico Mecânica'],
  usinagem: ['Administrador', 'Técnico Usinagem'],
  eletrica: ['Administrador', 'Técnico Elétrica'],
  laudos: ['Administrador'],
  consolidacao: ['Administrador', 'Administrativo'],
  orcamentos: ['Administrador', 'Administrativo'],
  pesquisa: ['Administrador', 'Administrativo'],
  relatorios: ['Administrador', 'Gestor'],
  historico: ['Administrador', 'Administrativo', 'Gestor'],
  clienteConsulta: ['Cliente'],
};

export function canAccess(profile, key) {
  return routePermissions[key]?.includes(profile);
}

export function getDefaultRoute(profile) {
  if (profile === 'Cliente') {
    return '/cliente/consulta-os';
  }

  if (profile?.startsWith('Técnico')) {
    const routes = {
      'Técnico Mecânica': '/mecanica',
      'Técnico Usinagem': '/usinagem',
      'Técnico Elétrica': '/eletrica',
    };
    return routes[profile] || '/login';
  }

  if (profile === 'Administrativo') {
    return '/ordens-servico';
  }

  return '/dashboard';
}
