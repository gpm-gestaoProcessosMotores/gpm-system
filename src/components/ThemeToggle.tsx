import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, getPreferredTheme } from '../utils/theme.js';
import Button from './Button.jsx';

type Theme = 'light' | 'dark';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  useEffect(() => {
    setTheme(applyTheme(getPreferredTheme()) as Theme);
  }, []);

  function toggleTheme() {
    setTheme(applyTheme(isDark ? 'light' : 'dark') as Theme);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      icon={Icon}
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
    >
      Tema
    </Button>
  );
}
