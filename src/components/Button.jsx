export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {Icon ? <Icon size={20} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
