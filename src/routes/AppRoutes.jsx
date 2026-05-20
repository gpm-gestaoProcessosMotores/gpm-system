import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ClientLayout from '../components/ClientLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleBasedRoute from '../components/RoleBasedRoute.jsx';
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
import TechnicalSectorPage from '../pages/TechnicalSectorPage.jsx';
import TechnicalSectorOrderPage from '../pages/TechnicalSectorOrderPage.jsx';
import TechnicalFlowPage from '../pages/TechnicalFlowPage.jsx';
import TechnicalReportsPage from '../pages/TechnicalReportsPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute permissionKey="clienteConsulta" />}>
          <Route element={<ClientLayout />}>
            <Route path="/cliente" element={<Navigate to="/cliente/consulta-os" replace />} />
            <Route path="/cliente/consulta-os" element={<ClientOrderConsultPage />} />
          </Route>
        </Route>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route element={<RoleBasedRoute permissionKey="dashboard" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="usuarios" />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="permissoes" />}>
            <Route path="/permissoes" element={<PermissionsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="setores" />}>
            <Route path="/setores" element={<SectorsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="funcionarios" />}>
            <Route path="/funcionarios" element={<EmployeesPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="clientes" />}>
            <Route path="/clientes" element={<ClientsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="motores" />}>
            <Route path="/motores" element={<MotorsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="ordens" />}>
            <Route path="/ordens" element={<OrdersPage />} />
            <Route path="/ordens/:id" element={<OrderDetailsPage />} />
            <Route path="/ordens-servico" element={<OrdersPage />} />
            <Route path="/ordens-servico/:id" element={<OrderDetailsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="qrcode" />}>
            <Route path="/qrcode" element={<QRCodePage />} />
            <Route path="/qrcode/:id" element={<QRCodePage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="leitor" />}>
            <Route path="/leitor-qr" element={<QRScannerPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="fluxo" />}>
            <Route path="/fluxo-tecnico" element={<TechnicalFlowPage />} />
            <Route path="/fluxo-tecnico/:id" element={<TechnicalFlowPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="mecanica" />}>
            <Route path="/mecanica" element={<TechnicalSectorPage sectorName="Mecânica" stageKey="mecanica" title="Área da Mecânica" />} />
            <Route path="/mecanica/os/:id" element={<TechnicalSectorOrderPage sectorName="Mecânica" stageKey="mecanica" title="Área da Mecânica" />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="usinagem" />}>
            <Route path="/usinagem" element={<TechnicalSectorPage sectorName="Usinagem" stageKey="usinagem" title="Área da Usinagem" />} />
            <Route path="/usinagem/os/:id" element={<TechnicalSectorOrderPage sectorName="Usinagem" stageKey="usinagem" title="Área da Usinagem" />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="eletrica" />}>
            <Route path="/eletrica" element={<TechnicalSectorPage sectorName="Elétrica" stageKey="eletrica" title="Área da Elétrica" />} />
            <Route path="/eletrica/os/:id" element={<TechnicalSectorOrderPage sectorName="Elétrica" stageKey="eletrica" title="Área da Elétrica" />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="laudos" />}>
            <Route path="/laudos" element={<TechnicalReportsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="consolidacao" />}>
            <Route path="/consolidacao" element={<ConsolidationPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="orcamentos" />}>
            <Route path="/orcamentos" element={<BudgetPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="pesquisa" />}>
            <Route path="/pesquisa" element={<SearchPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="relatorios" />}>
            <Route path="/relatorios" element={<ReportsPage />} />
          </Route>
          <Route element={<RoleBasedRoute permissionKey="historico" />}>
            <Route path="/historico" element={<HistoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
