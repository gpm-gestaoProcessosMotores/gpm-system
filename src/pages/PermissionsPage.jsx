import { Check, Minus } from 'lucide-react';
import Card from '../components/Card.jsx';
import { navigationItems } from '../components/Sidebar.jsx';
import { profiles } from '../mocks/initialData.js';
import { canAccess } from '../utils/permissions.js';

export default function PermissionsPage() {
  const permissionItems = [...navigationItems, { key: 'clienteConsulta', label: 'Consulta Cliente' }];

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Perfis mockados</p>
          <h2>Matriz de permissões</h2>
        </div>
      </div>

      <Card className="table-card">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Módulo</th>
              {profiles.map((profile) => (
                <th key={profile}>{profile}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionItems.map((item) => (
              <tr key={item.key}>
                <td data-label="Módulo">
                  <strong>{item.label}</strong>
                </td>
                {profiles.map((profile) => {
                  const allowed = canAccess(profile, item.key);
                  return (
                    <td data-label={profile} key={profile}>
                      <span className={`status ${allowed ? 'status-success' : 'status-muted'}`}>
                        {allowed ? <Check size={16} /> : <Minus size={16} />}
                        {allowed ? 'Permitido' : 'Bloqueado'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
