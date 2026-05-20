import { Printer, ScanLine } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import QRCodeCard from '../components/QRCodeCard.jsx';
import Select from '../components/Select.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { osService } from '../services/osService.js';

export default function QRCodePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const orders = osService.getVisibleOrdersForUser(user);
  const [selectedId, setSelectedId] = useState(id || orders[0]?.id || '');
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId]);

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Rastreabilidade</p>
          <h2>QR Code da Ordem de Serviço</h2>
        </div>
      </div>

      <div className="grid-2">
        <Select
          label="Ordem de Serviço"
          value={selectedId}
          options={orders.map((order) => ({ value: order.id, label: `${order.number} · ${order.status}` }))}
          onChange={(event) => setSelectedId(event.target.value)}
        />
      </div>

      <QRCodeCard order={selectedOrder} />

      <div className="row-actions">
        <Button icon={Printer} onClick={() => window.print()}>
          Imprimir etiqueta
        </Button>
        <Link className="btn btn-outline" to="/leitor-qr">
          <ScanLine size={18} /> <span>Simular leitura</span>
        </Link>
      </div>
    </div>
  );
}
