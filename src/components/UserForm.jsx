import Input from './Input.jsx';
import Select from './Select.jsx';

const technicianProfiles = ['Técnico Mecânica', 'Técnico Usinagem', 'Técnico Elétrica'];

export default function UserForm({ form, setForm, profiles, sectors, clients, employees, editing = false, errors = {} }) {
  const isClient = form.profile === 'Cliente';
  const isTechnician = technicianProfiles.includes(form.profile);

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
            linkedClientId: profile === 'Cliente' ? form.linkedClientId : '',
            linkedEmployeeId: profile === 'Cliente' ? '' : form.linkedEmployeeId,
            sector: technicianProfiles.includes(profile) ? form.sector : profile === 'Cliente' ? '' : form.sector || 'Administrativo',
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

      {isTechnician ? (
        <Select
          label="Setor"
          value={form.sector}
          options={sectors.filter((sector) => ['Mecânica', 'Usinagem', 'Elétrica'].includes(sector))}
          onChange={(event) => setForm({ ...form, sector: event.target.value })}
        />
      ) : null}

      {isClient ? (
        <Select
          label="Cliente vinculado"
          value={form.linkedClientId}
          options={[{ value: '', label: 'Selecione um cliente' }, ...clients.map((client) => ({ value: client.id, label: client.name }))]}
          onChange={(event) => setForm({ ...form, linkedClientId: event.target.value })}
        />
      ) : (
        <Select
          label="Funcionário vinculado"
          value={form.linkedEmployeeId}
          options={[
            { value: '', label: 'Selecione um funcionário' },
            ...employees.map((employee) => ({ value: employee.id, label: `${employee.name} · ${employee.sector}` })),
          ]}
          onChange={(event) => setForm({ ...form, linkedEmployeeId: event.target.value })}
        />
      )}

      <Select
        label="Status"
        value={form.status}
        options={['Ativo', 'Inativo']}
        onChange={(event) => setForm({ ...form, status: event.target.value })}
      />
      {errors.linkedClientId ? <p className="form-error span-2">{errors.linkedClientId}</p> : null}
      {errors.sector ? <p className="form-error span-2">{errors.sector}</p> : null}
      {errors.status ? <p className="form-error span-2">{errors.status}</p> : null}
    </div>
  );
}
