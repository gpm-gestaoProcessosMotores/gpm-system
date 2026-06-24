import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import OSStatusCard from '../components/OSStatusCard.jsx';
import OSTimeline from '../components/OSTimeline.jsx';
import { budgetService } from '../services/budgetService.js';
import { clientService } from '../services/clientService.js';
import { motorService } from '../services/motorService.js';
import { osService } from '../services/osService.js';
import { formatOSCode } from '../utils/validators.js';

export default function ClientOrderConsultPage() {
  const [code, setCode] = useState('ISJE23AK');
  const [searchedCode, setSearchedCode] = useState('');
  const [error, setError] = useState('');
  const clients = clientService.list();
  const motors = motorService.list();
  const budgets = budgetService.list();

  const order = useMemo(() => {
    if (!searchedCode) {
      return null;
    }

    return osService.getOrderByCode(searchedCode);
  }, [searchedCode]);

  const client = clients.find((item) => item.id === order?.clientId);
  const motor = motors.find((item) => item.id === order?.motorId);
  const budget = budgets.find((item) => item.orderId === order?.id);

  function handleSearch(event) {
    event.preventDefault();
    const formattedCode = formatOSCode(code);
    setCode(formattedCode);
    setSearchedCode(formattedCode);
    setError('');

    const foundOrder = osService.getOrderByCode(formattedCode);

    if (!foundOrder) {
      setError('Código não encontrado. Confira o código recebido na oficina.');
    }
  }

  return (
    <main className="client-shell bg-background text-foreground">
      <motion.div
        className="client-page content-grid client-consult"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
      <Card className="client-consult-hero">
        <p className="eyebrow">Consulta pública</p>
        <h1>Veja o estágio atual do seu motor</h1>
        <form className="client-search" onSubmit={handleSearch}>
          <Input
            label="Código de acompanhamento"
            value={code}
            onChange={(event) => setCode(formatOSCode(event.target.value))}
            placeholder="Exemplo: ISJE23AK"
            required
          />
          <Button type="submit" size="lg" icon={Search}>
            Consultar
          </Button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </Card>

      {order ? (
        <>
          <OSStatusCard order={order} client={client} motor={motor} budget={budget} />
          <Card className="stage-card">
            <p className="eyebrow">Histórico simplificado</p>
            <h2>Andamento da ordem</h2>
            <OSTimeline order={order} />
          </Card>
          <Card className="stage-card">
            <p className="eyebrow">Dados básicos do motor</p>
            <h2>{motor?.brand} {motor?.model}</h2>
            <div className="meta-grid">
              <span>Identificação: {motor?.identification}</span>
              <span>Potência: {motor?.power}</span>
              <span>Tensão: {motor?.voltage}</span>
              <span>Rotação: {motor?.rotation}</span>
            </div>
          </Card>
        </>
      ) : null}
      </motion.div>
    </main>
  );
}
