
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ThemeColors, CalculatorState, HistoryItem, Language, CustomSettings } from '../types';
import { Delete, Clock, Trash2, Cpu, X } from 'lucide-react';
import { saveCalculation, getAllCalculations } from '../database';

interface CalculatorProps {
  theme: ThemeColors;
  themeName: string;
  lang: Language;
  settings: CustomSettings;
}

const Calculator: React.FC<CalculatorProps> = ({ theme, themeName, lang, settings }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [lastExpression, setLastExpression] = useState(''); 
  const [isResult, setIsResult] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cursorPos, setCursorPos] = useState(1);

  const displayInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const loadDatabase = useCallback(async () => {
    try {
      const records = await getAllCalculations();
      setHistory(records);
    } catch (e) {
      console.error("DB Load Error", e);
    }
  }, []);

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  // Keep internal cursorPos in sync with native input selection
  useEffect(() => {
    const input = displayInputRef.current;
    if (input) {
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }, [cursorPos]);

  const playClickSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, [settings.soundEnabled]);

  const triggerHaptic = useCallback(() => {
    if (!settings.vibrationEnabled) return;
    if (window.navigator?.vibrate) window.navigator.vibrate(25);
  }, [settings.vibrationEnabled]);

  const onButtonInteraction = useCallback(() => {
    triggerHaptic();
    playClickSound();
  }, [triggerHaptic, playClickSound]);

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Infinity';
    const absNum = Math.abs(num);
    if (absNum !== 0 && (absNum >= 1e12 || absNum < 1e-7)) return num.toExponential(7).replace(/e\+?/, 'e');
    return parseFloat(num.toPrecision(12)).toString();
  };

  const safeEval = (expr: string): number => {
    try {
      let cleanExpr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/√\(/g, 'Math.sqrt(').replace(/\^/g, '**');
      return new Function(`return ${cleanExpr}`)();
    } catch (e) { return NaN; }
  };

  const insertAtCursor = (val: string) => {
    onButtonInteraction();
    let newDisplay = '';
    let newPos = cursorPos;

    if (isResult) {
      newDisplay = val;
      newPos = val.length;
      setIsResult(false);
      setLastExpression('');
    } else {
      const before = displayValue.slice(0, cursorPos);
      const after = displayValue.slice(cursorPos);
      
      if (displayValue === '0' && !isNaN(parseInt(val))) {
        newDisplay = val;
        newPos = val.length;
      } else {
        newDisplay = before + val + after;
        newPos = cursorPos + val.length;
      }
    }
    
    setDisplayValue(newDisplay);
    setCursorPos(newPos);
  };

  const handleEqual = () => {
    onButtonInteraction();
    const resultNum = safeEval(displayValue);
    const resultStr = formatNumber(resultNum);
    if (displayValue !== resultStr && !isNaN(resultNum)) {
      saveCalculation({ id: Date.now().toString(), expression: displayValue, result: resultStr, timestamp: Date.now() });
      setLastExpression(displayValue);
      setDisplayValue(resultStr);
      setIsResult(true);
      setCursorPos(resultStr.length); // Default back to end
    }
  };

  const handleDelete = () => {
    onButtonInteraction();
    if (displayValue.length === 0 || (displayValue.length === 1 && cursorPos === 1)) {
      setDisplayValue('0');
      setCursorPos(1);
      return;
    }

    const before = displayValue.slice(0, cursorPos - 1);
    const after = displayValue.slice(cursorPos);
    const newDisplay = before + after;
    
    setDisplayValue(newDisplay === '' ? '0' : newDisplay);
    setCursorPos(Math.max(0, cursorPos - 1));
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Basic sanitization for allowed math chars
    if (/^[0-9+\-*/. ×÷()^√sincoat]*$/.test(val) || val === '') {
      setDisplayValue(val === '' ? '0' : val);
      setCursorPos(e.target.selectionStart || 0);
    }
  };

  const handleManualSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPos(target.selectionStart || 0);
  };

  const buttons = useMemo(() => {
    const baseButtons = [
      { label: 'C', type: 'clear', action: () => { onButtonInteraction(); setDisplayValue('0'); setLastExpression(''); setIsResult(false); setCursorPos(1); } },
      { label: '(', type: 'func', action: () => insertAtCursor('(') },
      { label: ')', type: 'func', action: () => insertAtCursor(')') },
      { label: '÷', type: 'op', action: () => insertAtCursor(' ÷ ') },
      { label: '7', type: 'num', action: () => insertAtCursor('7') },
      { label: '8', type: 'num', action: () => insertAtCursor('8') },
      { label: '9', type: 'num', action: () => insertAtCursor('9') },
      { label: '×', type: 'op', action: () => insertAtCursor(' × ') },
      { label: '4', type: 'num', action: () => insertAtCursor('4') },
      { label: '5', type: 'num', action: () => insertAtCursor('5') },
      { label: '6', type: 'num', action: () => insertAtCursor('6') },
      { label: '-', type: 'op', action: () => insertAtCursor(' - ') },
      { label: '1', type: 'num', action: () => insertAtCursor('1') },
      { label: '2', type: 'num', action: () => insertAtCursor('2') },
      { label: '3', type: 'num', action: () => insertAtCursor('3') },
      { label: '+', type: 'op', action: () => insertAtCursor(' + ') },
      { label: '0', type: 'num', action: () => insertAtCursor('0') },
      { label: '.', type: 'num', action: () => insertAtCursor('.') },
      { label: <Delete size={20} />, type: 'func', action: handleDelete },
      { label: '=', type: 'eq', action: handleEqual },
    ];

    if (isAdvanced) {
      return [
        { label: 'sin', type: 'func', action: () => insertAtCursor('sin(') },
        { label: 'cos', type: 'func', action: () => insertAtCursor('cos(') },
        { label: 'tan', type: 'func', action: () => insertAtCursor('tan(') },
        { label: '^', type: 'func', action: () => insertAtCursor('^') },
        { label: '√', type: 'func', action: () => insertAtCursor('√(') },
        ...baseButtons
      ];
    }
    return baseButtons;
  }, [isAdvanced, displayValue, isResult, cursorPos]);

  const displayFontSize = useMemo(() => {
    const len = displayValue.length;
    if (len > 35) return '0.95rem';
    if (len > 25) return '1.2rem';
    if (len > 18) return '1.5rem';
    if (len > 12) return '1.9rem';
    return '2.8rem'; 
  }, [displayValue]);

  const t = {
    ar: { history: 'سجل العمليات', noResults: 'السجل فارغ' },
    en: { history: 'History', noResults: 'Empty' }
  }[lang];

  return (
    <div className="flex-1 flex flex-col w-full h-full max-w-2xl mx-auto overflow-hidden px-4 pb-6">
      <div className={`flex-[0.32] min-h-[20vh] flex flex-col items-end justify-end px-8 py-6 relative rounded-[1.5rem] mb-4 border ${theme.gridBorder} ${themeName === 'acacia' ? 'glass-card' : 'bg-black/20'}`}>
        <div className={`absolute top-4 flex gap-3 z-10 ${lang === 'ar' ? 'right-6' : 'left-6'}`}>
          <button onClick={() => { onButtonInteraction(); setShowHistory(true); loadDatabase(); }} className="btn-press p-2 rounded-lg border border-white/5 text-white/50"><Clock size={18} /></button>
          <button onClick={() => { onButtonInteraction(); setIsAdvanced(!isAdvanced); }} className={`btn-press p-2 rounded-lg border border-white/5 ${isAdvanced ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/30'}`}><Cpu size={18} /></button>
        </div>
        
        <div className={`font-bold opacity-30 min-h-[1.5rem] w-full mb-1 tracking-tight text-right ${theme.displayText} truncate`} dir="ltr">
          {lastExpression}
        </div>
        
        <input 
          ref={displayInputRef} 
          type="text" 
          value={displayValue} 
          onChange={handleManualChange}
          onSelect={handleManualSelect}
          className={`font-black text-right bg-transparent border-none outline-none ${theme.displayText} ${theme.textAccent} digital-segment w-full transition-all duration-300 cursor-text selection:bg-[#D4AF37]/30`} 
          style={{ fontSize: displayFontSize }}
          dir="ltr" 
        />
      </div>

      <div className={`grid ${isAdvanced ? 'grid-cols-5 gap-2.5' : 'grid-cols-4 gap-3.5'} p-5 rounded-[2rem] ${theme.gridBg} border ${theme.gridBorder} flex-[0.68] relative overflow-visible shadow-2xl shadow-black/60`}>
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`btn-press flex items-center justify-center border border-white/5 font-black rounded-2xl ${isAdvanced ? 'text-lg' : 'text-2xl'}
              ${btn.type === 'num' ? `${theme.buttonText} ${theme.button}` : ''}
              ${btn.type === 'op' ? `${theme.operator} ${theme.operatorText}` : ''}
              ${btn.type === 'eq' ? `${theme.equal} ${theme.equalText}` : ''}
              ${btn.type === 'clear' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : ''}
              ${btn.type === 'func' ? `${theme.displayText} bg-white/5` : ''}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/90 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setShowHistory(false)} />
          <div className={`h-[85%] w-full rounded-t-[2.5rem] animate-modal ${theme.card} border-t border-[#D4AF37]/20 flex flex-col overflow-hidden`}>
            <div className="w-16 h-1 bg-white/10 rounded-full mx-auto mt-6 mb-4" />
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5">
              <h4 className={`text-2xl font-black ${theme.textAccent}`}>{t.history}</h4>
              <button onClick={() => setShowHistory(false)} className="btn-press p-3.5 rounded-xl bg-white/5 text-white/50"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-6">
              {history.length === 0 ? <p className="text-center opacity-20 py-20">{t.noResults}</p> : history.map(item => (
                <div key={item.id} onClick={() => { onButtonInteraction(); setDisplayValue(item.expression); setCursorPos(item.expression.length); setIsResult(false); setShowHistory(false); }} className="btn-press p-6 rounded-2xl bg-white/5 border border-white/5 text-right">
                  <div className="text-[10px] opacity-20 mb-1" dir="ltr">{new Date(item.timestamp).toLocaleTimeString()}</div>
                  <div className={`text-2xl font-black ${theme.textAccent} digital-segment mb-1`} dir="ltr">{item.expression}</div>
                  <div className="text-sm font-bold opacity-40" dir="ltr">= {item.result}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
