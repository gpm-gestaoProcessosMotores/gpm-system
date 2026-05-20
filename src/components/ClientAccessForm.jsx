import Input from './Input.jsx';
import Select from './Select.jsx';

export default function ClientAccessForm({ form, setForm, errors = {} }) {
  return (
    <div className="client-access-box span-2">
      <label className="check-item">
        <input
          type="checkbox"
          checked={Boolean(form.allowLogin)}
          onChange={(event) => setForm({ ...form, allowLogin: event.target.checked })}
        />
        <span>Deseja permitir login para este cliente?</span>
      </label>

      {form.allowLogin ? (
        <div className="form-grid two">
          <Input
            label="E-mail/login"
            value={form.accessLogin}
            error={errors.accessLogin}
            onChange={(event) => setForm({ ...form, accessLogin: event.target.value })}
            required
          />
          <Input
            label="Senha inicial do cliente"
            type="password"
            value={form.accessPassword}
            error={errors.accessPassword}
            onChange={(event) => setForm({ ...form, accessPassword: event.target.value })}
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={form.accessConfirmPassword}
            error={errors.accessConfirmPassword}
            onChange={(event) => setForm({ ...form, accessConfirmPassword: event.target.value })}
          />
          <Select
            label="Status do acesso"
            value={form.accessStatus}
            options={['Ativo', 'Inativo']}
            onChange={(event) => setForm({ ...form, accessStatus: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
