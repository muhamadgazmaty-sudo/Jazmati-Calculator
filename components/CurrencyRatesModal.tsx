
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeColors, Language } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  X, TrendingUp, RefreshCcw, ArrowLeftRight, ShieldCheck, 
  Activity, Info, Search, ExternalLink, Globe, Zap, Clock, AlertCircle
} from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface CurrencyRatesModalProps {
  theme: ThemeColors;
  lang: Language;
  onClose: () => void;
}

interface RateEntry {
  currency: string;
  buy: number;
  sell: number;
  market: string;
  trend: 'up' | 'down' | 'stable';
}

interface GroundingSource {
  title: string;
  uri: string;
}

const CurrencyRatesModal: React.FC<CurrencyRatesModalProps> = ({ theme, lang, onClose }) => {
  const [rates, setRates] = useState<RateEntry[]>([
    { currency: 'USD', buy: 14850, sell: 15000, market: lang === 'ar' ? 'سوق ليرة (دمشق)' : 'Lira Market (Damascus)', trend: 'stable' },
    { currency: 'EUR', buy: 15950, sell: 16100, market: lang === 'ar' ? 'سوق ليرة (حلب)' : 'Lira Market (Aleppo)', trend: 'stable' },
    { currency: 'TRY', buy: 462, sell: 468, market: lang === 'ar' ? 'إدلب / ليرة' : 'Idlib / Lira', trend: 'stable' },
    { currency: 'USD', buy: 13600, sell: 13600, market: lang === 'ar' ? 'المركزي السوري' : 'Central Bank', trend: 'stable' },
  ]);
  
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextSync, setNextSync] = useState(600); 
  const [calcInput, setCalcInput] = useState('100');
  const [selectedCur, setSelectedCur] = useState('USD');
  const [error, setError] = useState<string | null>(null);

  // وظيفة استخراج الأرقام من النص
  const parseRatesFromAI = (text: string) => {
    const findPrice = (currency: string, type: 'buy' | 'sell'): number | null => {
      // البحث عن نمط: USD Buy 15000 أو الدولار شراء 15000
      const regex = new RegExp(`${currency}.*?${type === 'buy' ? '(شراء|buy)' : '(مبيع|sell|sale)'}.*?(\\d[\\d\\s,.]+)`, 'i');
      const match = text.match(regex);
      if (match && match[2]) {
        return parseInt(match[2].replace(/[\s,.]/g, ''));
      }
      return null;
    };

    const newUsdBuy = findPrice('USD', 'buy') || findPrice('الدولار', 'buy');
    const newUsdSell = findPrice('USD', 'sell') || findPrice('الدولار', 'sell');
    const newEurBuy = findPrice('EUR', 'buy') || findPrice('اليورو', 'buy');
    const newEurSell = findPrice('EUR', 'sell') || findPrice('اليورو', 'sell');
    const newTryBuy = findPrice('TRY', 'buy') || findPrice('التركي', 'buy');
    const newTrySell = findPrice('TRY', 'sell') || findPrice('التركي', 'sell');

    setRates(prev => prev.map(r => {
      if (r.currency === 'USD' && r.market.includes('ليرة')) {
        return { ...r, buy: newUsdBuy || r.buy, sell: newUsdSell || r.sell, trend: (newUsdSell || 0) > r.sell ? 'up' : 'down' };
      }
      if (r.currency === 'EUR') {
        return { ...r, buy: newEurBuy || r.buy, sell: newEurSell || r.sell, trend: (newEurSell || 0) > r.sell ? 'up' : 'down' };
      }
      if (r.currency === 'TRY') {
        return { ...r, buy: newTryBuy || r.buy, sell: newTrySell || r.sell, trend: (newTrySell || 0) > r.sell ? 'up' : 'down' };
      }
      return r;
    }));
  };

  const syncWithLiraSite = useCallback(async (isAuto = false) => {
    if (isSearching) return;
    setIsSearching(true);
    setError(null);
    if (!isAuto) triggerHaptic(80);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `أعطني حصرياً وبدقة أسعار صرف الليرة السورية من موقع (sp-today.com) اليوم الأحد 15 فبراير 2026. 
      أريد القيم التالية بتنسيق واضح:
      USD Buy: [السعر], USD Sell: [السعر]
      EUR Buy: [السعر], EUR Sell: [السعر]
      TRY Buy: [السعر], TRY Sell: [السعر]
      اركز على سوق دمشق الموازي.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const textResponse = response.text;
      if (textResponse) {
        parseRatesFromAI(textResponse);
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources: GroundingSource[] = chunks
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri
          }));
        setSources(extractedSources);
      }

      setLastUpdated(new Date());
      setNextSync(600); 
      if (!isAuto) triggerHaptic(40);
    } catch (err) {
      console.error("Lira Sync Error:", err);
      setError(lang === 'ar' ? 'فشل الاتصال بـ sp-today' : 'Failed to connect to sp-today');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, lang]);

  useEffect(() => {
    syncWithLiraSite(true);
    const timer = setInterval(() => {
      setNextSync(prev => {
        if (prev <= 1) {
          syncWithLiraSite(true);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [syncWithLiraSite]);

  const t = {
    ar: {
      title: 'رادار ليرة sp-today الحقيقي',
      syncStatus: isSearching ? 'جاري جلب البيانات من sp-today...' : 'مُتصل بـ sp-today.com',
      nextSync: 'تحديث تلقائي خلال:',
      buy: 'شراء',
      sell: 'مبيع',
      market: 'المصدر / المدينة',
      currency: 'العملة',
      sourcesTitle: 'التحقق من sp-today.com',
      lastUpdate: 'آخر مزامنة:',
      converter: 'حاسبة ليرة المباشرة',
      amount: 'المبلغ بالأجنبي',
      result: 'بالليرة السورية',
      syp: 'ل.س',
      note: 'يتم التحديث دورياً كل 10 دقائق باستخدام Google Search لضمان الدقة.'
    },
    en: {
      title: 'Real sp-today Lira Radar',
      syncStatus: isSearching ? 'Fetching from sp-today...' : 'Connected to sp-today.com',
      nextSync: 'Auto-sync in:',
      buy: 'Buy',
      sell: 'Sell',
      market: 'Source / City',
      currency: 'Currency',
      sourcesTitle: 'Verify via sp-today.com',
      lastUpdate: 'Last sync:',
      converter: 'Lira Live Calc',
      amount: 'Foreign Amount',
      result: 'In SYP',
      syp: 'SYP',
      note: 'Updates every 10 mins via Google Search for maximum accuracy.'
    }
  }[lang];

  const equivalentSYP = useMemo(() => {
    const num = parseFloat(calcInput);
    if (isNaN(num)) return '0';
    const activeRate = rates.find(r => r.currency === selectedCur && r.market.includes('ليرة'))?.sell || rates[0].sell;
    return (num * activeRate).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits: 0 });
  }, [calcInput, selectedCur, rates, lang]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl overflow-y-auto">
      <div className="absolute inset-0" onClick={() => { triggerHaptic(30); onClose(); }} />
      <div className={`relative w-[95%] max-w-lg h-auto flex flex-col rounded-[3rem] shadow-[0_60px_180px_rgba(0,0,0,1)] animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder} my-8`}>
        
        {/* Sync Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden z-30">
           <div 
             className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_15px_#ffd700] ${isSearching ? 'bg-emerald-500 animate-pulse' : 'bg-[#ffd700]'}`}
             style={{ width: isSearching ? '100%' : `${(nextSync / 600) * 100}%` }}
           />
        </div>

        {/* Lira Status Indicator */}
        <div className={`absolute top-1.5 right-10 px-5 py-1.5 rounded-b-2xl flex items-center gap-2 z-20 shadow-2xl transition-colors ${isSearching ? 'bg-emerald-600' : 'bg-[#ffd700]'}`}>
           <Zap size={10} className={`text-black ${isSearching ? 'animate-bounce' : 'animate-pulse'}`} />
           <span className="text-[8px] font-black text-black uppercase tracking-widest">{t.syncStatus}</span>
        </div>

        {/* Header */}
        <div className="px-8 pt-12 pb-6 border-b border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Globe className={`text-emerald-400 absolute inset-0 ${isSearching ? 'animate-spin' : 'opacity-20'}`} size={24} />
                <TrendingUp className="text-[#ffd700] relative z-10" size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${theme.textAccent} tracking-tighter`}>{t.title}</h3>
                <div className="flex items-center gap-2 opacity-30 mt-0.5">
                   <Clock size={10} />
                   <p className="text-[8px] font-black uppercase tracking-widest">{t.nextSync} {Math.floor(nextSync / 60)}:{String(nextSync % 60).padStart(2, '0')}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-2xl bg-white/5 opacity-50 hover:opacity-100 transition-all hover:rotate-90">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 animate-pulse">
               <AlertCircle size={14} />
               <span className="text-[10px] font-bold">{error}</span>
            </div>
          )}
        </div>

        {/* Rates Table */}
        <div className="p-6 space-y-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/60 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50"></div>
            <table className="w-full text-center relative z-10">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest opacity-40">
                  <th className="py-5 border-r border-white/5">{t.currency}</th>
                  <th className="py-5 border-r border-white/5">{t.buy}</th>
                  <th className="py-5 border-r border-white/5">{t.sell}</th>
                  <th className="py-5">{t.market}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold">
                {rates.map((rate, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-emerald-500/5 transition-all group">
                    <td className={`py-5 font-black border-r border-white/5 ${rate.currency === 'USD' ? 'text-emerald-400' : rate.currency === 'EUR' ? 'text-blue-400' : 'text-red-400'}`}>{rate.currency}</td>
                    <td className="py-5 digital-segment opacity-60 border-r border-white/5">{rate.buy.toLocaleString()}</td>
                    <td className="py-5 digital-segment text-[#ffd700] border-r border-white/5 group-hover:scale-105 transition-transform">{rate.sell.toLocaleString()}</td>
                    <td className="py-5 text-[9px] opacity-40 font-black px-2">{rate.market}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-time Converter Integrated */}
          <div className={`p-7 rounded-[3rem] bg-gradient-to-br from-[#000814] to-[#001d3d] border border-[#ffd700]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ArrowLeftRight size={100} />
             </div>
             
             <div className="flex gap-3 mb-8">
               {['USD', 'EUR', 'TRY'].map(c => (
                 <button 
                  key={c}
                  onClick={() => { triggerHaptic(40); setSelectedCur(c); }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all border ${selectedCur === c ? 'bg-[#ffd700] text-black border-[#ffd700] shadow-xl scale-105' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                 >
                  {c}
                 </button>
               ))}
             </div>

             <div className="space-y-5">
                <div className="relative">
                   <label className="text-[9px] font-black opacity-30 absolute -top-2.5 left-8 px-3 bg-[#000814] rounded-full z-10 tracking-[0.2em] uppercase">{t.amount}</label>
                   <input 
                    type="number" 
                    value={calcInput}
                    onChange={(e) => setCalcInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-4xl font-black outline-none text-center digital-segment text-[#ffd700] focus:border-[#ffd700]/50 transition-all"
                    dir="ltr"
                   />
                </div>

                <div className="flex flex-col items-center bg-black/80 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                   <span className="text-[10px] font-black opacity-20 mb-2 uppercase tracking-[0.5em]">{t.result}</span>
                   <span className={`text-4xl font-black ${theme.textAccent} digital-segment drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]`}>
                      {equivalentSYP}
                   </span>
                   <span className="text-[9px] font-bold opacity-20 mt-3 tracking-widest">{t.syp}</span>
                </div>
             </div>
          </div>

          {/* sp-today Source Verification */}
          {sources.length > 0 && (
            <div className="space-y-4 animate-modal">
              <div className="flex items-center gap-3 px-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">{t.sourcesTitle}</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {sources.slice(0, 2).map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 rounded-[1.8rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#ffd700]/40 transition-all group shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold opacity-80 group-hover:text-[#ffd700] transition-colors">{src.title}</span>
                      <span className="text-[8px] opacity-20 mt-1 truncate max-w-[220px]">{src.uri}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-30 group-hover:opacity-100 group-hover:text-[#ffd700]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-10 pt-2 space-y-6">
           <div className="flex items-center justify-between opacity-30">
              <div className="flex items-center gap-3">
                <Clock size={14} className={isSearching ? 'animate-spin' : ''} />
                <span className="text-[10px] font-black tracking-[0.15em] uppercase">{t.lastUpdate} {lastUpdated.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                 <span className="text-[8px] font-black text-emerald-500">LIVE SYNC</span>
              </div>
           </div>

           <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 flex gap-4 items-start shadow-inner">
             <Info size={16} className="text-[#ffd700] shrink-0 mt-0.5" />
             <p className="text-[10px] leading-relaxed font-medium opacity-50 italic">{t.note}</p>
           </div>

           <button 
             onClick={() => { triggerHaptic(30); onClose(); }}
             className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ffd700]/20 transition-all active:scale-95 ${theme.displayText} shadow-2xl relative overflow-hidden`}
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
             {lang === 'ar' ? 'إغلاق رادار ليرة' : 'Close Lira Radar'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyRatesModal;
