import { MapPin } from 'lucide-react';
import { formatCEP } from '../utils/validators.js';
import Input from './Input.jsx';
import LoadingButton from './LoadingButton.jsx';

export default function CepInput({ value, onChange, onSearch, loading, error }) {
  return (
    <div className="compound-field">
      <Input
        label="CEP"
        value={value}
        error={error}
        onChange={(event) => onChange(formatCEP(event.target.value))}
        placeholder="00000-000"
      />
      <LoadingButton variant="outline" icon={MapPin} loading={loading} loadingText="Buscando" onClick={onSearch}>
        Buscar CEP
      </LoadingButton>
    </div>
  );
}
