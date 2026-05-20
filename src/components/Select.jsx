export default function Select({ label, id, options = [], className = '', ...props }) {
  const selectId = id || props.name || label;

  return (
    <label className={`field ${className}`} htmlFor={selectId}>
      <span>{label}</span>
      <select id={selectId} {...props}>
        {options.map((option) => {
          const normalizedOption = typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
