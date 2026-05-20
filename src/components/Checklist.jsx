export default function Checklist({ items = [], onChange, readonly = false }) {
  return (
    <div className="checklist">
      {items.map((item, index) => (
        <label className="check-item" key={`${item.label}-${index}`}>
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
      ))}
    </div>
  );
}
