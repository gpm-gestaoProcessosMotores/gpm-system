import Input from './Input.jsx';
import Select from './Select.jsx';

export default function UserForm({ form, setForm, profiles, sectors, employees, editing = false, errors = {} }) {
  return (
    <div className="form-grid two">
      <Input
        label="Nome completo"
        value={form.name}
        error={errors.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
      />
      <Input
        label="E-mail"
        type="email"
        value={form.email}
        error={errors.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        required
      />
      <Input
        label="Login"
        value={form.login}
        error={errors.login}
        onChange={(event) => setForm({ ...form, login: event.target.value })}
        required
      />
      <Select
        label="Perfil"
        value={form.profile}
        options={profiles}
        onChange={(event) => {
          const profile = event.target.value;
          setForm({
            ...form,
            profile,
            sector: profile === 'Técnico' ? 'Oficina' : form.sector || 'Administrativo',
          });
        }}
      />

      {!editing ? (
        <>
          <Input
            label="Senha"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            required
          />
        </>
      ) : null}

      <Select
        label="Setor"
        value={form.sector}
        options={form.profile === 'Técnico' ? ['Oficina'] : sectors}
        onChange={(event) => setForm({ ...form, sector: event.target.value })}
      />

      <Select
        label="Funcionário vinculado"
        value={form.linkedEmployeeId}
        options={[
          { value: '', label: 'Selecione um funcionário' },
          ...employees.map((employee) => ({ value: employee.id, label: `${employee.name} · ${employee.sector}` })),
        ]}
        onChange={(event) => setForm({ ...form, linkedEmployeeId: event.target.value })}
      />

      <Select
        label="Status"
        value={form.status}
        options={['Ativo', 'Inativo']}
        onChange={(event) => setForm({ ...form, status: event.target.value })}
      />
      {errors.sector ? <p className="form-error span-2">{errors.sector}</p> : null}
      {errors.status ? <p className="form-error span-2">{errors.status}</p> : null}
    </div>
  );
}
