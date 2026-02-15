
import React from 'react';
import { ThemeType, Language, ThemeColors } from '../types';
import { Check } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  lang: Language;
  currentThemeColors: ThemeColors;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange, lang, currentThemeColors }) => {
  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'acacia', label: lang === 'ar' ? 'ثيم جزماتي' : 'Gazmaty theme', color: 'bg-[#d4af37]' },
    { id: 'shahba', label: lang === 'ar' ? 'ثيم الشهباء' : 'Shahba Theme', color: 'bg-slate-400 border border-amber-600' },
    { id: 'sham', label: lang === 'ar' ? 'ثيم شام' : 'Sham Theme', color: 'bg-gradient-to-t from-black via-white to-green-600 border border-slate-200' },
    { id: 'night', label: lang === 'ar' ? 'الوضع الليلي' : 'Night Mode', color: 'bg-black border border-white/20' },
    { id: 'light', label: lang === 'ar' ? 'الوضع النهاري' : 'Light Mode', color: 'bg-zinc-100 border border-zinc-300' },
    { id: 'pastel', label: lang === 'ar' ? 'باستيل' : 'Pastel', color: 'bg-pink-200 border border-pink-300' },
  ];

  return (
    <div className="space-y-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={`btn-press w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
            currentTheme === theme.id 
              ? 'bg-[#e6b94d]/20 border-[#e6b94d] shadow-lg shadow-[#e6b94d]/10' 
              : `${currentThemeColors.gridBg} ${currentThemeColors.gridBorder} opacity-80`
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-lg ${theme.color} shadow-sm`} />
            <span className={`text-xs font-black ${currentTheme === theme.id ? 'text-[#e6b94d]' : currentThemeColors.displayText}`}>
              {theme.label}
            </span>
          </div>
          {currentTheme === theme.id && <Check size={14} className="text-[#e6b94d]" />}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
