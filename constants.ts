
import { ThemeColors, ThemeType } from './types';

export const THEMES: Record<ThemeType, ThemeColors> = {
  acacia: {
    bg: 'bg-[#0A0A0A]', // Matte Charcoal Black
    card: 'bg-[#121212]', // Charcoal base
    display: 'bg-[#080808]', // Deep inset look
    displayText: 'text-[#D4AF37]', // Metallic Gold
    button: 'bg-[#1A1A1A]', // Dark geometric button
    buttonText: 'text-[#F3E5AB]',
    operator: 'bg-gradient-to-br from-[#8E6E37] to-[#D4AF37]', // Brushed Gold Gradient
    operatorText: 'text-[#0A0A0A]',
    equal: 'bg-[#D4AF37]',
    equalText: 'text-[#0A0A0A]',
    accent: '#D4AF37',
    gridBg: 'bg-[#0F0F0F]',
    gridBorder: 'border-[#D4AF37]/20',
    textAccent: 'acacia-text'
  },
  shahba: {
    bg: 'bg-gradient-to-br from-[#D1D5DB] via-[#9CA3AF] to-[#4B5563]',
    card: 'bg-[#1F2937]/95',
    display: 'bg-black/60',
    displayText: 'text-[#FDE68A]',
    button: 'bg-[#374151]/80',
    buttonText: 'text-[#F9FAFB]',
    operator: 'bg-gradient-to-br from-[#92400E] to-[#451A03]',
    operatorText: 'text-white',
    equal: 'bg-[#B45309]',
    equalText: 'text-white',
    accent: '#B45309',
    gridBg: 'bg-[#111827]/50',
    gridBorder: 'border-white/10',
    textAccent: 'shahba-text'
  },
  night: {
    bg: 'bg-black',
    card: 'bg-[#121212]/95',
    display: 'bg-black/60',
    displayText: 'text-white',
    button: 'bg-[#262626]',
    buttonText: 'text-white',
    operator: 'bg-[#333333]',
    operatorText: 'text-[#4a90e2]',
    equal: 'bg-[#4a90e2]',
    equalText: 'text-white',
    accent: '#4a90e2',
    gridBg: 'bg-white/5',
    gridBorder: 'border-white/5',
    textAccent: 'text-[#4a90e2]'
  },
  sham: {
    bg: 'bg-gradient-to-b from-[#007A3D] via-[#ffffff] to-[#000000]',
    card: 'bg-white/95',
    display: 'bg-white/60',
    displayText: 'text-black',
    button: 'bg-slate-100/90 shadow-sm border border-slate-200',
    buttonText: 'text-black',
    operator: 'bg-[#CE1126]',
    operatorText: 'text-white',
    equal: 'bg-[#007A3D]',
    equalText: 'text-white',
    accent: '#CE1126',
    gridBg: 'bg-white/40',
    gridBorder: 'border-[#007A3D]/20',
    textAccent: 'sham-text'
  },
  light: {
    bg: 'bg-gradient-to-br from-[#fdfcf0] via-[#fcfaf2] to-[#f5f2e8]',
    card: 'bg-[#fffef7]/95',
    display: 'bg-[#fefdfa]/40',
    displayText: 'text-[#5d5747]',
    button: 'bg-[#fffefc] shadow-sm border border-[#ede9db]',
    buttonText: 'text-[#5d5747]',
    operator: 'bg-[#f0ece0]',
    operatorText: 'text-[#8b7e66]',
    equal: 'bg-[#8b7e66]',
    equalText: 'text-white',
    accent: '#8b7e66',
    gridBg: 'bg-[#f5f2e8]/40',
    gridBorder: 'border-[#e8e4d8]',
    textAccent: 'text-[#8b7e66]'
  },
  pastel: {
    bg: 'bg-gradient-to-tr from-[#ff9a9e] 0%, #fecfef 99%, #fecfef 100%',
    card: 'bg-white/90',
    display: 'bg-white/40',
    displayText: 'text-[#d44d5c]',
    button: 'bg-white/70 border border-white/50',
    buttonText: 'text-[#d44d5c]',
    operator: 'bg-[#ffccd2]',
    operatorText: 'text-[#d44d5c]',
    equal: 'bg-[#d44d5c]',
    equalText: 'text-white',
    accent: '#ff9a9e',
    gridBg: 'bg-white/30',
    gridBorder: 'border-white/50',
    textAccent: 'text-[#d44d5c]'
  }
};
