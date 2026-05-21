import { Check, Plus, RotateCcw, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import { profiles } from '../mocks/initialData.js';
import {
  getPermissionConfig,
  makePermissionKey,
  resetPermissionConfig,
  savePermissionConfig,
} from '../utils/permissions.js';

const adminProfile = 'Administrador';

function buildEmptyFunction() {
  return { label: '', key: '' };
}

export default function PermissionsPage() {
  const [config, setConfig] = useState(getPermissionConfig());
  const [newFunction, setNewFunction] = useState(buildEmptyFunction());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sortedItems = useMemo(
    () => [...config.items].sort((a, b) => Number(a.system === false) - Number(b.system === false)),
    [config.items],
  );

  function updateItemLabel(key, label) {
    setConfig((current) => ({
      ...current,
      items: current.items.map((item) => (item.key === key ? { ...item, label } : item)),
    }));
    setMessage('Alterações pendentes.');
    setError('');
  }

  function togglePermission(key, profile) {
    if (profile === adminProfile) {
      return;
    }

    setConfig((current) => {
      const currentProfiles = current.permissions[key] || [adminProfile];
      const nextProfiles = currentProfiles.includes(profile)
        ? currentProfiles.filter((currentProfile) => currentProfile !== profile)
        : [...currentProfiles, profile];

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [key]: Array.from(new Set([adminProfile, ...nextProfiles])),
        },
      };
    });
    setMessage('Alterações pendentes.');
    setError('');
  }

  function addFunction(event) {
    event.preventDefault();
    const label = newFunction.label.trim();
    const key = makePermissionKey(newFunction.key || label);

    if (!label) {
      setError('Informe o nome da função.');
      return;
    }

    if (!key) {
      setError('Informe uma chave técnica válida.');
      return;
    }

    if (config.items.some((item) => item.key === key)) {
      setError('Já existe uma função com essa chave.');
      return;
    }

    setConfig((current) => ({
      ...current,
      items: [...current.items, { key, label, system: false, route: '' }],
      permissions: {
        ...current.permissions,
        [key]: [adminProfile],
      },
    }));
    setNewFunction(buildEmptyFunction());
    setMessage('Função adicionada. Salve para aplicar.');
    setError('');
  }

  function removeFunction(key) {
    const item = config.items.find((current) => current.key === key);
    if (!item || item.system) {
      return;
    }

    const nextPermissions = { ...config.permissions };
    delete nextPermissions[key];
    setConfig((current) => ({
      ...current,
      items: current.items.filter((currentItem) => currentItem.key !== key),
      permissions: nextPermissions,
    }));
    setMessage('Função removida. Salve para aplicar.');
    setError('');
  }

  function saveChanges() {
    const savedConfig = savePermissionConfig(config);
    setConfig(savedConfig);
    setMessage('Permissões salvas com sucesso.');
    setError('');
  }

  function restoreDefaults() {
    setConfig(resetPermissionConfig());
    setNewFunction(buildEmptyFunction());
    setMessage('Permissões restauradas para o padrão.');
    setError('');
  }

  return (
    <div className="content-grid">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Administrador</p>
          <h2>Controle de permissões</h2>
        </div>
        <div className="row-actions">
          <Button variant="outline" icon={RotateCcw} onClick={restoreDefaults}>
            Restaurar padrão
          </Button>
          <Button icon={Save} onClick={saveChanges}>
            Salvar alterações
          </Button>
        </div>
      </div>

      {message ? <p className="status status-cyan">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <Card className="permission-add-card">
        <div>
          <p className="eyebrow">Nova função</p>
          <h3>Adicionar função personalizada</h3>
        </div>
        <form className="permission-add-form" onSubmit={addFunction}>
          <Input
            label="Nome da função"
            value={newFunction.label}
            onChange={(event) =>
              setNewFunction((current) => ({
                ...current,
                label: event.target.value,
                key: makePermissionKey(event.target.value),
              }))
            }
            placeholder="Exemplo: Aprovar compra"
          />
          <Input
            label="Chave técnica"
            value={newFunction.key}
            onChange={(event) => setNewFunction((current) => ({ ...current, key: makePermissionKey(event.target.value) }))}
            placeholder="aprovar-compra"
          />
          <Button type="submit" icon={Plus}>
            Adicionar
          </Button>
        </form>
      </Card>

      <div className="permission-grid">
        {sortedItems.map((item) => (
          <Card className="permission-card" key={item.key}>
            <div className="permission-card-header">
              <div className="permission-title-field">
                <span className={`status ${item.system ? 'status-info' : 'status-warning'}`}>
                  {item.system ? 'Sistema' : 'Personalizada'}
                </span>
                <Input
                  label="Função"
                  value={item.label}
                  onChange={(event) => updateItemLabel(item.key, event.target.value)}
                />
                <span className="permission-key">{item.key}</span>
              </div>
              {!item.system ? (
                <Button variant="danger" size="icon" icon={Trash2} onClick={() => removeFunction(item.key)}>
                  Remover
                </Button>
              ) : null}
            </div>

            <div className="permission-profiles">
              {profiles.map((profile) => {
                const checked = config.permissions[item.key]?.includes(profile);
                const locked = profile === adminProfile;
                return (
                  <label className={`permission-toggle ${checked ? 'is-checked' : ''} ${locked ? 'is-locked' : ''}`} key={profile}>
                    <input
                      type="checkbox"
                      checked={Boolean(checked)}
                      disabled={locked}
                      onChange={() => togglePermission(item.key, profile)}
                    />
                    <span className="permission-check">{checked ? <Check size={16} /> : null}</span>
                    <span>{profile}</span>
                    {locked ? <ShieldCheck size={16} /> : null}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
