
import React, { useState, useMemo, useCallback } from 'react';
import { ThemeColors, Language } from '../types';
import { X, Coins, ArrowLeftRight, ChevronDown, Info, Calculator as CalcIcon } from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface CurrencyConverterModalProps {
  theme: ThemeColors;
  lang: Language;
  onClose: () => void;
}

const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ theme, lang, onClose }) => {
  const [mode, setMode] = useState<'SYP_TO_SYN' | 'SYN_TO_SYP'>('SYP_TO_SYN');
  const [inputValue, setInputValue] = useState('1000');

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return '0.00';
    
    if (mode === 'SYP_TO_SYN') {
      // القديم إلى الجديد: حذف صفرين (قسمة على 100)
      return (num / 100).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    } else {
      // الجديد إلى القديم: ضرب في 100
      return (num * 100).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { 
        maximumFractionDigits: 0 
      });
    }
  }, [inputValue, mode, lang]);

  const t = {
    ar: {
      title: 'محول العملة السورية 2026',
      oldLabel: 'الليرة القديمة (SYP)',
      newLabel: 'الليرة الجديدة (SYN)',
      info: 'ملاحظة: الليرة السورية الجديدة تعادل 100 ليرة قديمة (حذف صفرين).',
      valueLabel: 'المبلغ المراد تحويله',
      resultLabel: 'المبلغ المعادل',
      placeholder: 'أدخل المبلغ هنا...',
      switch: 'تبديل اتجاه التحويل',
      oldHint: 'قديم',
      newHint: 'جديد'
    },
    en: {
      title: 'SYR Currency 2026',
      oldLabel: 'Old Lira (SYP)',
      newLabel: 'New Lira (SYN)',
      info: 'Note: 1 SYN equals 100 SYP (zeros removed).',
      valueLabel: 'Amount to convert',
      resultLabel: 'Equivalent Amount',
      placeholder: 'Enter amount...',
      switch: 'Switch direction',
      oldHint: 'Old',
      newHint: 'New'
    }
  }[lang];

  const handleModeSwitch = () => {
    triggerHaptic(60);
    setMode(prev => prev === 'SYP_TO_SYN' ? 'SYN_TO_SYP' : 'SYP_TO_SYN');
    // اختياري: تحويل القيمة الحالية لتسهيل التجربة
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      if (mode === 'SYP_TO_SYN') setInputValue((num / 100).toString());
      else setInputValue((num * 100).toString());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
      <div className="absolute inset-0" onClick={() => { triggerHaptic(30); onClose(); }} />
      <div className={`relative w-[92%] max-w-sm h-auto flex flex-col rounded-[2.5rem] shadow-2xl animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#e6b94d]/20">
              <Coins className={theme.textAccent} size={20} />
            </div>
            <h3 className={`text-lg font-black ${theme.textAccent}`}>{t.title}</h3>
          </div>
          <button onClick={() => { triggerHaptic(30); onClose(); }} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="opacity-50" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Info Card */}
          <div className={`p-3 rounded-xl bg-white/5 border border-white/5 flex gap-2.5 items-start`}>
            <Info size={16} className="text-[#e6b94d] shrink-0 mt-0.5" />
            <p className="text-[9px] leading-relaxed opacity-60 font-bold">{t.info}</p>
          </div>

          {/* Mode Selector Display */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${mode === 'SYP_TO_SYN' ? 'border-[#e6b94d] bg-[#e6b94d]/5' : 'border-white/5 opacity-40'}`}>
              <span className="text-[9px] font-black uppercase mb-0.5">{mode === 'SYP_TO_SYN' ? t.oldHint : t.newHint}</span>
              <span className="font-bold text-xs">{mode === 'SYP_TO_SYN' ? 'SYP' : 'SYN'}</span>
            </div>
            
            <button 
              onClick={handleModeSwitch}
              className={`p-3 rounded-full bg-white/5 border border-white/10 ${theme.displayText} hover:bg-white/10 active:rotate-180 transition-all duration-500 shadow-md`}
            >
              <ArrowLeftRight size={20} />
            </button>

            <div className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${mode === 'SYN_TO_SYP' ? 'border-[#e6b94d] bg-[#e6b94d]/5' : 'border-white/5 opacity-40'}`}>
              <span className="text-[9px] font-black uppercase mb-0.5">{mode === 'SYN_TO_SYP' ? t.oldHint : t.newHint}</span>
              <span className="font-bold text-xs">{mode === 'SYN_TO_SYP' ? 'SYP' : 'SYN'}</span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Input Section */}
            <div className={`p-4 rounded-2xl ${theme.gridBg} border border-white/5 shadow-inner`}>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">
                {t.valueLabel} ({mode === 'SYP_TO_SYN' ? 'SYP' : 'SYN'})
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`w-full bg-transparent text-3xl font-black outline-none ${theme.displayText} digital-segment`}
                  placeholder={t.placeholder}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Result Section */}
            <div className={`relative p-6 rounded-[2rem] bg-black/40 border border-[#e6b94d]/20 text-center shadow-xl overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#e6b94d]/40 to-transparent"></div>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5 block">{t.resultLabel}</label>
              <div className="flex items-center justify-center gap-2">
                <div className={`text-4xl font-black ${theme.textAccent} digital-segment truncate px-1`} dir="ltr">
                  {result}
                </div>
                <div className="text-lg font-black opacity-30 mt-1">
                  {mode === 'SYP_TO_SYN' ? 'SYN' : 'SYP'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Calc Helper */}
          <div className="grid grid-cols-2 gap-2.5">
             <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[8px] opacity-40 block uppercase font-black">{lang === 'ar' ? 'القاعدة' : 'RULE'}</span>
                <span className="text-[10px] font-bold">{mode === 'SYP_TO_SYN' ? '÷ 100' : '× 100'}</span>
             </div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[8px] opacity-40 block uppercase font-black">{lang === 'ar' ? 'الرمز' : 'SYMBOL'}</span>
                <span className="text-[10px] font-bold">{mode === 'SYP_TO_SYN' ? 'SYN' : 'SYP'}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverterModal;
