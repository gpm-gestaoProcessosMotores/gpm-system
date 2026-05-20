export default function Input({ label, id, error, className = '', ...props }) {
  const inputId = id || props.name || label;

  return (
    <label className={`field ${className}`} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
