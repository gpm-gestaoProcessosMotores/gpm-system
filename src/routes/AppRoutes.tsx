import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout.tsx';
import ProtectedRoute from '../components/ProtectedRoute.tsx';
import RoleBasedRoute from '../components/RoleBasedRoute.tsx';
import BudgetPage from '../pages/BudgetPage.jsx';
import ClientsPage from '../pages/ClientsPage.jsx';
import ClientOrderConsultPage from '../pages/ClientOrderConsultPage.jsx';
import ConsolidationPage from '../pages/ConsolidationPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import EmployeesPage from '../pages/EmployeesPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MotorsPage from '../pages/MotorsPage.jsx';
import OrderDetailsPage from '../pages/OrderDetailsPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import PermissionsPage from '../pages/PermissionsPage.jsx';
import QRCodePage from '../pages/QRCodePage.jsx';
import QRScannerPage from '../pages/QRScannerPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import SectorsPage from '../pages/SectorsPage.jsx';
import TechnicalFlowPage from '../pages/TechnicalFlowPage.jsx';
import TechnicalReportsPage from '../pages/TechnicalReportsPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';

interface AppRoute {
  path: string;
  element: ReactElement;
}

interface PermissionRouteGroup {
  permissionKey: string;
  routes: AppRoute[];
}

const publicRoutes: AppRoute[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/consulta', element: <ClientOrderConsultPage /> },
  { path: '/cliente/*', element: <Navigate to="/consulta" replace /> },
];

const permissionRouteGroups: PermissionRouteGroup[] = [
  {
    permissionKey: 'dashboard',
    routes: [{ path: '/dashboard', element: <DashboardPage /> }],
  },
  {
    permissionKey: 'usuarios',
    routes: [{ path: '/usuarios', element: <UsersPage /> }],
  },
  {
    permissionKey: 'permissoes',
    routes: [{ path: '/permissoes', element: <PermissionsPage /> }],
  },
  {
    permissionKey: 'setores',
    routes: [{ path: '/setores', element: <SectorsPage /> }],
  },
  {
    permissionKey: 'funcionarios',
    routes: [{ path: '/funcionarios', element: <EmployeesPage /> }],
  },
  {
    permissionKey: 'clientes',
    routes: [{ path: '/clientes', element: <ClientsPage /> }],
  },
  {
    permissionKey: 'motores',
    routes: [{ path: '/motores', element: <MotorsPage /> }],
  },
  {
    permissionKey: 'ordens',
    routes: [
      { path: '/ordens', element: <OrdersPage /> },
      { path: '/ordens/:id', element: <OrderDetailsPage /> },
      { path: '/ordens-servico', element: <OrdersPage /> },
      { path: '/ordens-servico/:id', element: <OrderDetailsPage /> },
    ],
  },
  {
    permissionKey: 'qrcode',
    routes: [
      { path: '/qrcode', element: <QRCodePage /> },
      { path: '/qrcode/:id', element: <QRCodePage /> },
    ],
  },
  {
    permissionKey: 'leitor',
    routes: [{ path: '/leitor-qr', element: <QRScannerPage /> }],
  },
  {
    permissionKey: 'tecnico',
    routes: [
      { path: '/tecnico', element: <TechnicalFlowPage /> },
      { path: '/tecnico/:id', element: <TechnicalFlowPage /> },
      { path: '/fluxo-tecnico', element: <Navigate to="/tecnico" replace /> },
      { path: '/fluxo-tecnico/:id', element: <TechnicalFlowPage /> },
    ],
  },
  {
    permissionKey: 'laudos',
    routes: [{ path: '/laudos', element: <TechnicalReportsPage /> }],
  },
  {
    permissionKey: 'consolidacao',
    routes: [{ path: '/consolidacao', element: <ConsolidationPage /> }],
  },
  {
    permissionKey: 'orcamentos',
    routes: [{ path: '/orcamentos', element: <BudgetPage /> }],
  },
  {
    permissionKey: 'pesquisa',
    routes: [{ path: '/pesquisa', element: <SearchPage /> }],
  },
  {
    permissionKey: 'relatorios',
    routes: [{ path: '/relatorios', element: <ReportsPage /> }],
  },
  {
    permissionKey: 'historico',
    routes: [{ path: '/historico', element: <HistoryPage /> }],
  },
];

const technicalLegacyRedirects: AppRoute[] = [
  { path: '/mecanica/*', element: <Navigate to="/tecnico" replace /> },
  { path: '/usinagem/*', element: <Navigate to="/tecnico" replace /> },
  { path: '/eletrica/*', element: <Navigate to="/tecnico" replace /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {permissionRouteGroups.map((group) => (
            <Route key={group.permissionKey} element={<RoleBasedRoute permissionKey={group.permissionKey} />}>
              {group.routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          ))}

          {technicalLegacyRedirects.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
