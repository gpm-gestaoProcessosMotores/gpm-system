import { ScanLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Select from '../components/Select.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { osService } from '../services/osService.js';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orders = osService.getVisibleOrdersForUser(user);
  const [selectedId, setSelectedId] = useState(orders[0]?.id || '');

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Leitura simulada</p>
          <h2>Scanner de QR Code</h2>
        </div>
      </div>

      <Card className="stage-card">
        <div className="scan-simulator">
          <div className="scan-frame">
            <ScanLine size={54} />
            <span>Área da câmera</span>
          </div>
        </div>
        <Select
          label="Resultado simulado"
          value={selectedId}
          options={orders.map((order) => ({ value: order.id, label: `${order.number} · ${order.currentSector}` }))}
          onChange={(event) => setSelectedId(event.target.value)}
        />
        <div className="row-actions">
          <Button icon={ScanLine} onClick={() => navigate(`/ordens-servico/${selectedId}`)}>
            Ler QR Code
          </Button>
        </div>
      </Card>
    </div>
  );
}
