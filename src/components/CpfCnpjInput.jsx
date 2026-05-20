import { Building2, CheckCircle2 } from 'lucide-react';
import { formatCNPJ, formatCPF, onlyNumbers } from '../utils/validators.js';
import Input from './Input.jsx';
import LoadingButton from './LoadingButton.jsx';

export default function CpfCnpjInput({ value, onChange, onValidate, onSearchCnpj, loading, error }) {
  const isCnpj = onlyNumbers(value).length > 11;

  function handleChange(event) {
    const digits = onlyNumbers(event.target.value);
    onChange(digits.length > 11 ? formatCNPJ(digits) : formatCPF(digits));
  }

  return (
    <div className="compound-field">
      <Input label="CPF/CNPJ" value={value} error={error} onChange={handleChange} placeholder="CPF ou CNPJ" required />
      <LoadingButton variant="outline" icon={CheckCircle2} onClick={onValidate}>
        Validar
      </LoadingButton>
      <LoadingButton variant="outline" icon={Building2} loading={loading} loadingText="Buscando" disabled={!isCnpj} onClick={onSearchCnpj}>
        Buscar CNPJ
      </LoadingButton>
    </div>
  );
}
