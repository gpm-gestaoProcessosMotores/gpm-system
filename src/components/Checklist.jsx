import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from './Button.jsx';

export default function Checklist({ items = [], onChange, readonly = false, editable = false }) {
  const [newItem, setNewItem] = useState('');

  function addItem() {
    const label = newItem.trim();
    const duplicated = items.some((item) => item.label.trim().toLocaleLowerCase('pt-BR') === label.toLocaleLowerCase('pt-BR'));

    if (!label || duplicated) {
      return;
    }

    onChange?.([...items, { label, done: false }]);
    setNewItem('');
  }

  function removeItem(index) {
    onChange?.(items.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="checklist">
      {editable && !readonly ? (
        <div className="checklist-composer">
          <label className="field">
            <span>Novo item do checklist</span>
            <input
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addItem();
                }
              }}
              placeholder="Ex.: Verificar folga do rolamento"
            />
          </label>
          <Button type="button" variant="outline" icon={Plus} disabled={!newItem.trim()} onClick={addItem}>
            Adicionar item
          </Button>
        </div>
      ) : null}

      {!items.length ? <p className="checklist-empty">Nenhum item cadastrado nesta etapa.</p> : null}

      {items.map((item, index) => (
        <div className="check-item-row" key={`${item.label}-${index}`}>
          <label className="check-item">
            <input
              type="checkbox"
              checked={Boolean(item.done)}
              disabled={readonly}
              onChange={(event) => {
                const nextItems = items.map((current, currentIndex) =>
                  currentIndex === index ? { ...current, done: event.target.checked } : current,
                );
                onChange?.(nextItems);
              }}
            />
            <span>{item.label}</span>
          </label>
          {editable && !readonly ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon={Trash2}
              className="check-item-remove"
              aria-label={`Remover ${item.label}`}
              title="Remover item"
              onClick={() => removeItem(index)}
            >
              Remover
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
