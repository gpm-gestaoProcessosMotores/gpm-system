import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type CardTag = 'article' | 'div' | 'section';

const motionByTag = {
  article: motion.article,
  div: motion.div,
  section: motion.section,
};

export interface CardProps {
  children: ReactNode;
  className?: string;
  as?: CardTag;
  interactive?: boolean;
}

export default function Card({ children, className = '', as = 'section', interactive = true }: CardProps) {
  const Component = motionByTag[as];

  return (
    <Component
      className={`card bg-card text-card-foreground ${className}`.trim()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      whileHover={interactive ? { y: -1 } : undefined}
    >
      {children}
    </Component>
  );
}
