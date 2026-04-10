import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('et_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('et_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
};
