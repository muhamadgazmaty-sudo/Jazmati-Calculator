
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeColors, Language, HistoryItem } from '../types';
import { X, Mic, MicOff, Trash2, Calculator as CalcIcon, Clock, History, ArrowRight } from 'lucide-react';
import { saveCalculation, getAllCalculations } from '../database';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface VoiceCalculatorModalProps {
  theme: ThemeColors;
  lang: Language;
  onClose: () => void;
}

const VoiceCalculatorModal: React.FC<VoiceCalculatorModalProps> = ({ theme, lang, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<HistoryItem[]>([]);
  
  const recognitionRef = useRef<any>(null);

  const t = {
    ar: {
      title: 'الحاسبة الصوتية الذكية',
      start: 'ابدأ التحدث',
      stop: 'إيقاف الاستماع',
      listening: 'جاري الاستماع...',
      placeholder: 'قل مثلاً: خمسة زائد عشرة',
      resultLabel: 'النتيجة',
      clear: 'مسح',
      error: 'لم أفهم ذلك، حاول مرة أخرى',
      noMic: 'الميكروفون غير متوفر',
      guide: 'الكلمات المدعومة: زائد، ناقص، ضرب، تقسيم، يساوي، مسح.',
      speakBtn: 'تحدث الآن',
      historyTitle: 'سجل العمليات الصوتية',
      noHistory: 'لا يوجد سجل صوتي بعد'
    },
    en: {
      title: 'Smart Voice Calculator',
      start: 'Start Speaking',
      stop: 'Stop Listening',
      listening: 'Listening...',
      placeholder: 'Say e.g.: Five plus ten',
      resultLabel: 'Result',
      clear: 'Clear',
      error: 'Could not understand, try again',
      noMic: 'Microphone not available',
      guide: 'Supported: plus, minus, multiply, divide, equals, clear.',
      speakBtn: 'Speak Now',
      historyTitle: 'Voice History',
      noHistory: 'No voice history yet'
    }
  }[lang];

  const loadVoiceHistory = useCallback(async () => {
    const all = await getAllCalculations();
    // نحن نستخدم نفس قاعدة البيانات، لكن يمكننا فلترة العمليات التي تمت اليوم أو عرض الكل
    setVoiceHistory(all.slice(0, 10)); // عرض آخر 10 عمليات
  }, []);

  useEffect(() => {
    loadVoiceHistory();
  }, [loadVoiceHistory]);

  const calculateResult = async (expr: string) => {
    try {
      if (!expr || expr === '0') return;
      // eslint-disable-next-line no-eval
      const res = eval(expr);
      const resStr = parseFloat(res.toFixed(8)).toString();
      setResult(resStr);
      triggerHaptic(60);

      // حفظ في السجل
      await saveCalculation({
        id: `voice-${Date.now()}`,
        expression: expr,
        result: resStr,
        timestamp: Date.now()
      });
      loadVoiceHistory();
    } catch (e) {
      setError(t.error);
    }
  };

  const processVoiceInput = (text: string) => {
    let cleanText = text.toLowerCase();
    
    const mappings: Record<string, string> = {
      'زائد': '+', 'ناقص': '-', 'ضرب': '*', 'في': '*', 'تقسيم': '/', 'على': '/', 'يساوي': '=', 'ساوي': '=', 'مسح': 'clear',
      'صفر': '0', 'واحد': '1', 'اثنين': '2', 'ثلاثة': '3', 'اربعة': '4', 'خمسة': '5', 'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تسعة': '9', 'عشرة': '10',
      'plus': '+', 'minus': '-', 'times': '*', 'multiply': '*', 'divide': '/', 'over': '/', 'equals': '=', 'clear': 'clear',
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };

    if (cleanText.includes('مسح') || cleanText.includes('clear')) {
      handleClear();
      return;
    }

    Object.keys(mappings).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      cleanText = cleanText.replace(regex, mappings[key]);
    });

    let mathExpr = cleanText.replace(/[^0-9+\-*/.= \(\)]/g, '').trim();
    
    if (mathExpr.endsWith('=')) {
      mathExpr = mathExpr.slice(0, -1);
      calculateResult(mathExpr);
    }
    
    setExpression(mathExpr);
    setTranscript(text);
  };

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t.noMic);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      processVoiceInput(finalTranscript || interimTranscript);
    };

    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [lang, t.error, t.noMic]);

  useEffect(() => {
    initSpeechRecognition();
    return () => recognitionRef.current?.stop();
  }, [initSpeechRecognition]);

  const toggleListening = () => {
    triggerHaptic(50);
    if (isListening) recognitionRef.current?.stop();
    else { setError(null); recognitionRef.current?.start(); }
  };

  const handleClear = () => {
    triggerHaptic(30);
    setExpression('');
    setTranscript('');
    setResult(null);
    setError(null);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    triggerHaptic(40);
    setExpression(item.result); // نضع النتيجة كبداية لعملية جديدة
    setResult(null);
    setShowHistory(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-[90%] max-w-sm rounded-[3rem] shadow-2xl animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder} flex flex-col min-h-[500px]`}>
        
        {/* Header Section */}
        <div className="h-20 bg-gradient-to-b from-white/5 to-transparent relative flex items-center justify-between px-8 shrink-0">
          <button 
            onClick={() => { triggerHaptic(30); setShowHistory(!showHistory); }}
            className={`p-2.5 rounded-xl transition-all ${showHistory ? 'bg-[#d4af37] text-black shadow-lg scale-110' : 'bg-white/5 opacity-40 hover:opacity-100'}`}
          >
            <History size={20} />
          </button>
          
          <div className="flex flex-col items-center">
             <h3 className={`text-sm font-black ${theme.textAccent} brand-font`}>{showHistory ? t.historyTitle : t.title}</h3>
             {!showHistory && isListening && <span className="text-[7px] font-bold text-emerald-400 animate-pulse tracking-widest uppercase">{t.listening}</span>}
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all opacity-40 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 relative overflow-hidden">
          {/* Main Voice Calc Interface */}
          <div className={`p-8 flex flex-col gap-6 transition-all duration-500 ${showHistory ? 'translate-x-full opacity-0 scale-95 pointer-events-none' : 'translate-x-0 opacity-100 scale-100'}`}>
            <div className="text-center">
              <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">{t.guide}</p>
            </div>

            <div className={`p-6 rounded-[2rem] ${theme.gridBg} border border-white/5 shadow-inner flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden group`}>
               {isListening && (
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent animate-pulse" />
               )}
              {error ? (
                <span className="text-red-400 text-xs font-bold text-center animate-bounce">{error}</span>
              ) : (
                <>
                  <span className={`text-2xl font-black text-center digital-segment ${theme.displayText} ${!expression ? 'opacity-20' : 'opacity-100'} break-all px-2 transition-all`}>
                    {expression || t.placeholder}
                  </span>
                  <span className="text-[8px] opacity-20 mt-3 font-mono italic text-center max-w-xs">{transcript}</span>
                </>
              )}
            </div>

            {result && (
              <div className="p-6 rounded-[2.5rem] bg-[#d4af37]/10 border border-[#d4af37]/20 flex flex-col items-center justify-center shadow-lg animate-modal relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><CalcIcon size={40} /></div>
                <span className="text-[9px] font-black text-[#d4af37] opacity-60 uppercase tracking-[0.3em] mb-1">{t.resultLabel}</span>
                <span className={`text-5xl font-black text-[#d4af37] digital-segment drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]`}>{result}</span>
              </div>
            )}

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={handleClear}
                className={`flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${theme.displayText} active:scale-95 transition-all`}
              >
                <Trash2 size={16} /> {t.clear}
              </button>
              <button 
                onClick={toggleListening}
                className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${isListening ? 'bg-red-500 text-white' : `${theme.equal} ${theme.equalText}`}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? t.stop : t.speakBtn}
              </button>
            </div>
          </div>

          {/* History Interface */}
          <div className={`absolute inset-0 p-6 flex flex-col gap-4 transition-all duration-500 ${showHistory ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-full opacity-0 scale-95 pointer-events-none'}`}>
             <div className="flex-1 overflow-y-auto space-y-3 px-2 custom-scrollbar">
                {voiceHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                     <History size={48} />
                     <p className="text-xs font-bold">{t.noHistory}</p>
                  </div>
                ) : (
                  voiceHistory.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d4af37]/30 transition-all cursor-pointer group active:scale-[0.98]"
                    >
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] opacity-20 font-mono" dir="ltr">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity" dir="ltr">{item.expression}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className={`text-xl font-black ${theme.textAccent} digital-segment`} dir="ltr">{item.result}</span>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                       </div>
                    </div>
                  ))
                )}
             </div>
             <button 
               onClick={() => setShowHistory(false)}
               className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
             >
                {lang === 'ar' ? 'العودة للتحدث' : 'Back to Voice'}
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-white/5 bg-black/20 shrink-0">
             <div className="flex items-center justify-center gap-1.5 opacity-20">
                <CalcIcon size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Jazmati AI Voice Engine 1.2</span>
             </div>
        </div>
      </div>

      <style>{`
        @keyframes voice-pulse {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.1); }
        }
        .animate-voice-pulse { animation: voice-pulse infinite ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default VoiceCalculatorModal;
