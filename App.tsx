
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeType, Language, ThemeColors, CustomSettings } from './types';
import { THEMES } from './constants';
import Calculator from './components/Calculator';
import ThemeSwitcher from './components/ThemeSwitcher';
import NotesModal from './components/NotesModal';
import ConverterModal from './components/ConverterModal';
import CurrencyConverterModal from './components/CurrencyConverterModal';
import CurrencyRatesModal from './components/CurrencyRatesModal';
import CustomizationModal from './components/CustomizationModal';
import VoiceCalculatorModal from './components/VoiceCalculatorModal';
import { User, X, MessageCircle, Mail, Moon, Sun, Settings, Globe, ShieldCheck, NotebookPen, Info, Scale, Coins, Sliders, Mic } from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

const BrandCalculatorIcon: React.FC = () => {
  return (
    <div className="brand-icon-outer shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      <div className="brand-icon-border"></div>
      <div className="brand-icon-inner">
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-1 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
          </div>
          <span className="text-[14px] font-black text-[#d4af37] tracking-tighter brand-font text-center leading-tight">
            حاسبة<br/>الجزماتي
          </span>
          <div className="mt-2 w-10 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
          <div className="text-[6px] font-bold opacity-30 mt-1 uppercase tracking-widest text-[#d4af37]">
            Premium Edition
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('jazmati_theme') as ThemeType) || 'acacia');
  
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('jazmati_lang') as Language | null;
    if (savedLang) return savedLang;
    
    const browserLang = navigator.language || (navigator as any).userLanguage;
    return browserLang?.startsWith('ar') ? 'ar' : 'en';
  });

  const [settings, setSettings] = useState<CustomSettings>(() => {
    const saved = localStorage.getItem('jazmati_custom_settings');
    return saved ? JSON.parse(saved) : { vibrationEnabled: true, soundEnabled: false };
  });
  
  const [showDesigner, setShowDesigner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showCurrencyRates, setShowCurrencyRates] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showVoiceCalculator, setShowVoiceCalculator] = useState(false);

  useEffect(() => {
    localStorage.setItem('jazmati_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jazmati_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('jazmati_custom_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleDarkMode = () => {
    if (settings.vibrationEnabled) triggerHaptic(50);
    setTheme(prev => (prev === 'light' ? 'night' : 'light'));
  };

  const toggleLanguage = () => {
    if (settings.vibrationEnabled) triggerHaptic(50);
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const currentTheme = THEMES[theme];

  const t = {
    ar: {
      subTitle: 'Calculator',
      designerTitle: 'المصمم',
      designerName: 'Muhamad Jazmati',
      designerRole: 'تصميم تطبيقات أندرويد مع قواعد بيانات',
      contact: 'طلب تطبيق مخصص (واتساب)',
      email: 'راسل المطور (إيميل)',
      createdDate: 'تم إنشاء التطبيق 2026',
      versionLabel: 'الإصدار 1.0',
      settings: 'الإعدادات المتقدمة',
      languageLabel: 'لغة الواجهة',
      themeLabel: 'سمة العرض',
      notesLabel: 'مذكرة المستخدم',
      converterLabel: 'محول الوحدات',
      currencyConverterLabel: 'تحويل العملة (الجديدة/القديمة)',
      currencyRatesLabel: 'أسعار العملات اللحظية',
      customizationLabel: 'تخصيص',
      voiceCalcLabel: 'الحاسبة الصوتية',
      waMessage: 'مرحبا انا استعمل تطبيق الالة الحاسبة من تطويرك هل استطيع الحصول على تطبيق خاص بشركتي'
    },
    en: {
      subTitle: 'Calculator',
      designerTitle: 'Designer',
      designerName: 'Muhamad Jazmati',
      designerRole: 'Android App Design with Databases',
      contact: 'Custom App Request (WhatsApp)',
      email: 'Contact Dev (Email)',
      createdDate: 'App Created 2026',
      versionLabel: 'Version 1.0',
      settings: 'Advanced Settings',
      languageLabel: 'Interface Language',
      themeLabel: 'Visual Theme',
      notesLabel: 'User Notes',
      converterLabel: 'Unit Converter',
      currencyConverterLabel: 'Currency (New/Old) Converter',
      currencyRatesLabel: 'Live Exchange Rates',
      customizationLabel: 'Customization',
      voiceCalcLabel: 'Voice Calculator',
      waMessage: 'Hi, I am using the calculator app you developed. Can I get a custom app for my company?'
    }
  }[lang];

  const getDesignerRgbClass = () => {
    if (theme === 'acacia') return 'designer-rgb-acacia';
    if (theme === 'shahba') return 'shahba-text';
    if (theme === 'night') return 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]';
    return 'font-black ' + currentTheme.displayText;
  };

  return (
    <div className={`fixed inset-0 w-full h-full flex flex-col transition-all duration-700 ease-in-out ${currentTheme.bg} font-sans overflow-hidden ${theme === 'acacia' ? 'luxury-geometric' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {theme === 'acacia' && <div className="luxury-frame"></div>}
      <div className="absolute inset-0 luxury-pattern pointer-events-none"></div>

      <header className="flex items-center justify-between px-6 pt-12 pb-2 z-40">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-lg`}>
              <h1 className={`text-2xl font-black tracking-tighter drop-shadow-sm leading-none brand-font jazmati-rgb-glow`}>
                Jazmati
              </h1>
            </div>
            <ShieldCheck size={14} className={`animate-pulse ${theme === 'night' ? 'text-white' : (theme === 'light' ? 'text-yellow-500' : currentTheme.displayText)}`} />
          </div>
          <div className="flex items-center gap-1.5 mt-2 px-1">
            <span className={`h-[2px] w-4 rounded-full ${theme === 'sham' ? 'bg-[#CE1126]' : (theme === 'acacia' ? 'bg-[#d4af37]' : (theme === 'shahba' ? 'bg-[#D97706]' : currentTheme.displayText.replace('text-', 'bg-')))}`}></span>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-60 ${currentTheme.displayText}`}>
              {t.subTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className={`btn-press p-3 rounded-2xl backdrop-blur-3xl border transition-all ${currentTheme.gridBg} ${currentTheme.gridBorder} ${currentTheme.displayText} border-white/5 shadow-lg`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="relative">
            <button 
              onClick={() => { if (settings.vibrationEnabled) triggerHaptic(40); setShowSettings(!showSettings); }}
              className={`btn-press p-3 rounded-2xl backdrop-blur-3xl border transition-all ${currentTheme.gridBg} ${currentTheme.gridBorder} ${currentTheme.displayText} border-white/5 shadow-lg`}
            >
              <Settings size={18} className={showSettings ? 'rotate-90 transition-transform duration-500' : 'transition-transform duration-500'} />
            </button>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { if (settings.vibrationEnabled) triggerHaptic(30); setShowSettings(false); }} />
                <div className={`absolute top-full mt-4 ${lang === 'ar' ? 'left-0' : 'right-0'} w-64 p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-20 animate-modal ${currentTheme.card} border ${currentTheme.gridBorder} backdrop-blur-3xl max-h-[70vh] overflow-y-auto`}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${currentTheme.displayText}`}>{t.settings}</span>
                    <button onClick={() => setShowSettings(false)} className={`p-1 rounded-lg hover:bg-white/5 ${currentTheme.displayText}`}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2.5">
                      <button 
                        onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowVoiceCalculator(true); setShowSettings(false); }}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} hover:brightness-110 shadow-sm border-white/5`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Mic size={16} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{t.voiceCalcLabel}</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowNotes(true); setShowSettings(false); }}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} hover:brightness-110`}
                      >
                        <div className="flex items-center gap-2.5">
                          <NotebookPen size={16} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{t.notesLabel}</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowConverter(true); setShowSettings(false); }}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} hover:brightness-110 shadow-sm border-white/5`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Scale size={16} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{t.converterLabel}</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowCurrencyConverter(true); setShowSettings(false); }}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} hover:brightness-110 shadow-sm border-white/5`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Coins size={16} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{t.currencyConverterLabel}</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowCustomization(true); setShowSettings(false); }}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} hover:brightness-110 shadow-sm border-white/5`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders size={16} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{t.customizationLabel}</span>
                        </div>
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      <label className={`text-[9px] font-black uppercase tracking-widest opacity-60 px-1 ${currentTheme.displayText}`}>
                        {t.languageLabel}
                      </label>
                      <button 
                        onClick={toggleLanguage}
                        className={`btn-press w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${currentTheme.gridBg} border ${currentTheme.gridBorder} ${currentTheme.displayText} shadow-sm`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe size={14} className={theme === 'sham' ? 'text-[#CE1126]' : (theme === 'acacia' ? 'text-[#d4af37]' : 'text-current')} />
                          <span className="font-bold text-xs">{lang === 'ar' ? 'العربية' : 'English'}</span>
                        </div>
                        <span className="text-[8px] font-black opacity-30">{lang === 'ar' ? 'EN' : 'AR'}</span>
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      <label className={`text-[9px] font-black uppercase tracking-widest opacity-60 px-1 ${currentTheme.displayText}`}>
                        {t.themeLabel}
                      </label>
                      <ThemeSwitcher currentTheme={theme} onThemeChange={(newTheme) => { if (settings.vibrationEnabled) triggerHaptic(60); setTheme(newTheme); }} lang={lang} currentThemeColors={currentTheme} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => { if (settings.vibrationEnabled) triggerHaptic(50); setShowDesigner(true); }}
            className={`btn-press p-3 rounded-2xl backdrop-blur-3xl border transition-all ${currentTheme.gridBg} ${currentTheme.gridBorder} ${currentTheme.displayText} border-white/5 shadow-lg`}
          >
            <User size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Calculator theme={currentTheme} themeName={theme} lang={lang} settings={settings} />
      </main>

      {showVoiceCalculator && <VoiceCalculatorModal theme={currentTheme} lang={lang} onClose={() => setShowVoiceCalculator(false)} />}
      {showNotes && <NotesModal theme={currentTheme} lang={lang} onClose={() => setShowNotes(false)} />}
      {showConverter && <ConverterModal theme={currentTheme} lang={lang} onClose={() => setShowConverter(false)} />}
      {showCurrencyConverter && <CurrencyConverterModal theme={currentTheme} lang={lang} onClose={() => setShowCurrencyConverter(false)} />}
      {showCurrencyRates && <CurrencyRatesModal theme={currentTheme} lang={lang} onClose={() => setShowCurrencyRates(false)} />}
      {showCustomization && <CustomizationModal theme={currentTheme} lang={lang} settings={settings} onUpdateSettings={setSettings} onClose={() => setShowCustomization(false)} />}

      {showDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="absolute inset-0" onClick={() => setShowDesigner(false)} />
          <div className={`relative w-[90%] max-w-sm p-6 rounded-[2.5rem] shadow-2xl animate-modal text-center ${currentTheme.card} border ${currentTheme.gridBorder} overflow-hidden`}>
            <button 
              onClick={() => setShowDesigner(false)}
              className={`btn-press absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} p-2 rounded-xl bg-white/5 border border-white/5 shadow-sm z-50`}
            >
              <X size={20} className={currentTheme.displayText} />
            </button>
            <div className="flex flex-col items-center gap-4 mb-6 mt-2">
               <BrandCalculatorIcon />
            </div>
            <h3 className={`text-xl font-black mb-1 ${getDesignerRgbClass()} brand-font`}>{t.designerName}</h3>
            <p className={`text-[8px] font-bold opacity-60 mb-6 px-2 leading-relaxed ${currentTheme.displayText}`}>{t.designerRole}</p>
            
            {/* Moving Light Frame Around Buttons */}
            <div className="moving-light-container">
              <div className="moving-light-inner p-4 space-y-3">
                <div className="flex flex-col gap-3">
                    <a href={`whatsapp://send?phone=306974193285&text=${encodeURIComponent(t.waMessage)}`} className={`btn-press flex items-center justify-center gap-2.5 w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/10 border border-emerald-500/20`}>
                      <MessageCircle size={18} className="text-emerald-400" />
                      <span className="text-xs tracking-wide">{t.contact}</span>
                    </a>
                    <a href="mailto:muhamadgazmaty@gmail.com" className={`btn-press flex items-center justify-center gap-2.5 w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-blue-500/10 border border-blue-500/20`}>
                      <Mail size={18} className="text-blue-400" />
                      <span className="text-[10px] tracking-wide font-mono">muhamadgazmaty@gmail.com</span>
                    </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default App;
