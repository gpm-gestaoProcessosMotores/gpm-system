import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`.trim()}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {Icon ? <Icon size={20} aria-hidden="true" /> : null}
      <span>{children}</span>
    </motion.button>
  );
}
