
import React, { useState, useMemo, useCallback } from 'react';
import { ThemeColors, Language } from '../types';
import { X, Ruler, ArrowLeftRight, ChevronDown, Scale, Thermometer } from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface ConverterModalProps {
  theme: ThemeColors;
  lang: Language;
  onClose: () => void;
}

type ConverterCategory = 'length' | 'weight' | 'temperature';

const UNITS: Record<ConverterCategory, { label: string; value: string; factor: number | ((v: number, to: boolean) => number) }[]> = {
  length: [
    { label: 'كم', value: 'km', factor: 1000 },
    { label: 'متر', value: 'm', factor: 1 },
    { label: 'سم', value: 'cm', factor: 0.01 },
    { label: 'مم', value: 'mm', factor: 0.001 },
    { label: 'ميل', value: 'mile', factor: 1609.34 },
    { label: 'قدم', value: 'ft', factor: 0.3048 },
    { label: 'بوصة', value: 'in', factor: 0.0254 },
  ],
  weight: [
    { label: 'طن', value: 't', factor: 1000 },
    { label: 'كجم', value: 'kg', factor: 1 },
    { label: 'جرام', value: 'g', factor: 0.001 },
    { label: 'رطل', value: 'lb', factor: 0.453592 },
    { label: 'أونصة', value: 'oz', factor: 0.0283495 },
  ],
  temperature: [
    { label: 'سيلزيوس', value: 'C', factor: (v, to) => to ? v : v },
    { label: 'فهرنهايت', value: 'F', factor: (v, to) => to ? (v * 9/5) + 32 : (v - 32) * 5/9 },
    { label: 'كلفن', value: 'K', factor: (v, to) => to ? v + 273.15 : v - 273.15 },
  ]
};

const ConverterModal: React.FC<ConverterModalProps> = ({ theme, lang, onClose }) => {
  const [convCat, setConvCat] = useState<ConverterCategory>('length');
  const [fromUnit, setFromUnit] = useState(UNITS.length[0].value);
  const [toUnit, setToUnit] = useState(UNITS.length[1].value);
  const [inputValue, setInputValue] = useState('1');

  const convertValue = (val: string, cat: ConverterCategory, from: string, to: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    
    const units = UNITS[cat];
    const fromU = units.find(u => u.value === from);
    const toU = units.find(u => u.value === to);
    
    if (!fromU || !toU) return '0';

    let baseValue: number;
    if (typeof fromU.factor === 'function') {
      baseValue = fromU.factor(num, false);
    } else {
      baseValue = num * fromU.factor;
    }

    let finalValue: number;
    if (typeof toU.factor === 'function') {
      finalValue = toU.factor(baseValue, true);
    } else {
      finalValue = baseValue / toU.factor;
    }

    return parseFloat(finalValue.toFixed(6)).toString();
  };

  const result = useMemo(() => convertValue(inputValue, convCat, fromUnit, toUnit), [inputValue, convCat, fromUnit, toUnit]);

  const t = {
    ar: {
      title: 'محول الوحدات',
      length: 'الطول',
      weight: 'الوزن',
      temp: 'الحرارة',
      from: 'من',
      to: 'إلى',
      valueLabel: 'القيمة المراد تحويلها',
      resultLabel: 'النتيجة',
    },
    en: {
      title: 'Unit Converter',
      length: 'Length',
      weight: 'Weight',
      temp: 'Temperature',
      from: 'From',
      to: 'To',
      valueLabel: 'Value to convert',
      resultLabel: 'Result',
    }
  }[lang];

  const categoryIcons = {
    length: <Ruler size={16} />,
    weight: <Scale size={16} />,
    temperature: <Thermometer size={16} />
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={() => { triggerHaptic(30); onClose(); }} />
      <div className={`relative w-[92%] max-w-sm h-auto flex flex-col rounded-[2.5rem] shadow-2xl animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scale className={theme.textAccent} size={20} />
            <h3 className={`text-lg font-black ${theme.textAccent}`}>{t.title}</h3>
          </div>
          <button onClick={() => { triggerHaptic(30); onClose(); }} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="opacity-50" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {(['length', 'weight', 'temperature'] as ConverterCategory[]).map(cat => (
              <button 
                key={cat} 
                onClick={() => { 
                  triggerHaptic(50); 
                  setConvCat(cat); 
                  setFromUnit(UNITS[cat][0].value); 
                  setToUnit(UNITS[cat][1].value); 
                }} 
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold transition-all ${convCat === cat ? `${theme.equal} ${theme.equalText} shadow-md scale-[1.01]` : `text-white/40 hover:bg-white/5`}`}
              >
                {categoryIcons[cat]}
                {t[cat]}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {/* Input Value */}
            <div className={`p-4 rounded-2xl ${theme.gridBg} border border-white/5 shadow-inner`}>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t.valueLabel}</label>
              <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full bg-transparent text-3xl font-black outline-none ${theme.displayText} digital-segment`}
                placeholder="0"
                dir="ltr"
              />
            </div>

            {/* Selection Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.from}</label>
                <div className={`relative p-3 rounded-xl bg-white/5 border border-white/10 ${theme.displayText}`}>
                  <select 
                    value={fromUnit} 
                    onChange={(e) => { triggerHaptic(40); setFromUnit(e.target.value); }}
                    className="w-full bg-transparent outline-none font-bold text-xs appearance-none pr-6 cursor-pointer"
                  >
                    {UNITS[convCat].map(u => <option key={u.value} value={u.value} className="bg-slate-900 text-white">{u.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                </div>
              </div>

              <button 
                onClick={() => { triggerHaptic(60); const f = fromUnit; setFromUnit(toUnit); setToUnit(f); }}
                className={`mt-4 p-3 rounded-xl bg-white/5 border border-white/10 ${theme.displayText} active:rotate-180 transition-transform duration-500`}
              >
                <ArrowLeftRight size={18} />
              </button>

              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">{t.to}</label>
                <div className={`relative p-3 rounded-xl bg-white/5 border border-white/10 ${theme.displayText}`}>
                  <select 
                    value={toUnit} 
                    onChange={(e) => { triggerHaptic(40); setToUnit(e.target.value); }}
                    className="w-full bg-transparent outline-none font-bold text-xs appearance-none pr-6 cursor-pointer"
                  >
                    {UNITS[convCat].map(u => <option key={u.value} value={u.value} className="bg-slate-900 text-white">{u.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Result Display */}
            <div className={`p-6 rounded-[2rem] bg-black/40 border border-white/10 text-center shadow-lg`}>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5 block">{t.resultLabel}</label>
              <div className={`text-4xl font-black ${theme.textAccent} digital-segment truncate px-1`} dir="ltr">
                {result}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterModal;
