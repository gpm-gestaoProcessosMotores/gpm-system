import QRCode from 'react-qr-code';
import Card from './Card.jsx';

export default function QRCodeCard({ order }) {
  const value = JSON.stringify({
    type: 'GPM_OS',
    orderId: order?.id,
    number: order?.number,
    trackingCode: order?.trackingCode,
  });

  return (
    <Card className="qr-card">
      <div className="qr-box">
        <QRCode value={value} size={210} viewBox="0 0 256 256" />
      </div>
      <div>
        <p className="eyebrow">Etiqueta da Ordem</p>
        <h2>{order?.number || 'Selecione uma OS'}</h2>
        <p className="muted">Código para consulta do cliente: <strong>{order?.trackingCode || '-'}</strong></p>
      </div>
    </Card>
  );
}
