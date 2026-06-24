import { FileText, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import Button from './Button.jsx';

export default function FileUpload({
  files = [],
  onChange,
  disabled = false,
  className = '',
  title = 'Arquivos da etapa',
  description = 'Fotos e documentos técnicos',
  accept = 'image/*,.pdf,.doc,.docx',
}) {
  const inputRef = useRef(null);

  function addFiles(event) {
    const selectedFiles = Array.from(event.target.files || []).map((file) => file.name);
    onChange?.(Array.from(new Set([...files, ...selectedFiles])));
    event.target.value = '';
  }

  function removeFile(index) {
    onChange?.(files.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className={`file-upload ${className}`.trim()}>
      <input
        ref={inputRef}
        className="file-upload-input"
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={addFiles}
      />
      <div className="file-upload-header">
        <div className="file-upload-copy">
          <span className="file-upload-icon"><Upload size={20} /></span>
          <div>
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          icon={Upload}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Selecionar arquivos
        </Button>
      </div>

      {files.length ? (
        <div className="file-upload-list">
          {files.map((file, index) => (
            <div className="file-upload-item" key={`${file}-${index}`}>
              <FileText size={18} />
              <span>{file}</span>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  icon={X}
                  aria-label={`Remover ${file}`}
                  title="Remover arquivo"
                  onClick={() => removeFile(index)}
                >
                  Remover
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <span className="file-upload-empty">Nenhum arquivo selecionado.</span>
      )}
    </div>
  );
}
