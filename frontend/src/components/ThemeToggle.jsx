// frontend/src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ className = '', style = {} }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95 ${
        isDark
          ? "border-emerald-800/60 bg-[#16221c] text-emerald-400 hover:bg-[#1f3027] hover:text-emerald-300"
          : "border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm"
      } ${className}`}
      style={style}
    >
      {isDark ? (
        <Sun size={17} className="transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={17} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
