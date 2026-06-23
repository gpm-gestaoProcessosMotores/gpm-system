const THEME_STORAGE_KEY = 'gpm_theme';

export function getStoredTheme() {
  if (typeof localStorage === 'undefined') {
    return 'light';
  }

  return localStorage.getItem(THEME_STORAGE_KEY) || '';
}

export function getPreferredTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme) {
  const safeTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', safeTheme === 'dark');
  document.documentElement.dataset.theme = safeTheme;
  localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
  return safeTheme;
}
