import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function Modal({ title, open, onClose, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="Fechar modal">
            Fechar
          </Button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
