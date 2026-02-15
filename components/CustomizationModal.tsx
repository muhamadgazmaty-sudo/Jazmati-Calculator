
import React, { useState } from 'react';
import { ThemeColors, Language, CustomSettings } from '../types';
import { 
  X, Sliders, Smartphone, Volume2, Cloud, Mail, 
  RefreshCw, CheckCircle2, Zap, ToggleLeft, ToggleRight, 
  ArrowRight, ArrowLeft, ShieldCheck, KeyRound 
} from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface CustomizationModalProps {
  theme: ThemeColors;
  lang: Language;
  settings: CustomSettings;
  onUpdateSettings: (settings: CustomSettings) => void;
  onClose: () => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ theme, lang, settings, onUpdateSettings, onClose }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'EMAIL' | 'VERIFY'>('IDLE');
  const [emailInput, setEmailInput] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const t = {
    ar: {
      title: 'تخصيص',
      vibration: 'تفعيل الاهتزاز عند النقر',
      sound: 'تفعيل الصوت عند النقر',
      cloudSync: 'المزامنة السحابية',
      linkGoogle: 'ربط حساب غوغل للمزامنة',
      syncNow: 'مزامنة البيانات الآن',
      syncing: 'جاري المزامنة...',
      lastSync: 'آخر مزامنة:',
      linkedAs: 'مرتبط بحساب:',
      unlink: 'إلغاء الربط',
      syncDesc: 'قم بمزامنة الملاحظات والعمليات الحسابية تلقائياً عبر السحابة لضمان عدم ضياع بياناتك.',
      autoSync: 'المزامنة التلقائية',
      done: 'إغلاق',
      enterEmail: 'أدخل بريدك الإلكتروني',
      emailPlaceholder: 'example@gmail.com',
      sendCode: 'إرسال رمز التأكيد',
      verifyTitle: 'تأكيد الحساب',
      verifyDesc: 'تم إرسال رمز تأكيد إلى بريدك الإلكتروني. يرجى إدخاله هنا لإتمام عملية الربط لأول مرة.',
      codePlaceholder: '0 0 0 0',
      confirmCode: 'تأكيد وربط الحساب',
    },
    en: {
      title: 'Customization',
      vibration: 'Enable Vibration',
      sound: 'Enable Sound',
      cloudSync: 'Cloud Sync',
      linkGoogle: 'Link Google for Sync',
      syncNow: 'Sync Data Now',
      syncing: 'Syncing...',
      lastSync: 'Last sync:',
      linkedAs: 'Linked as:',
      unlink: 'Unlink',
      syncDesc: 'Keep your notes and operations safe by syncing them automatically to the cloud.',
      autoSync: 'Auto-Sync',
      done: 'Close',
      enterEmail: 'Enter your email',
      emailPlaceholder: 'example@gmail.com',
      sendCode: 'Send Verification Code',
      verifyTitle: 'Verify Account',
      verifyDesc: 'A confirmation code was sent to your email. Please enter it below to link for the first time.',
      codePlaceholder: '0 0 0 0',
      confirmCode: 'Verify & Link Account',
    }
  }[lang];

  const toggleVibration = () => {
    const newVib = !settings.vibrationEnabled;
    if (newVib) triggerHaptic(40);
    onUpdateSettings({ ...settings, vibrationEnabled: newVib });
  };

  const toggleSound = () => {
    const newSound = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: newSound });
    if (settings.vibrationEnabled) triggerHaptic(30);
  };

  const toggleAutoSync = () => {
    const newAutoSync = !settings.autoSyncEnabled;
    triggerHaptic(40);
    onUpdateSettings({ ...settings, autoSyncEnabled: newAutoSync });
  };

  const handleStartLinking = () => {
    triggerHaptic(40);
    setStep('EMAIL');
  };

  const handleSendCode = () => {
    if (!emailInput.includes('@')) return;
    triggerHaptic(60);
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStep('VERIFY');
      triggerHaptic(100);
    }, 1500);
  };

  const handleVerifyAndLink = () => {
    if (verifyCode.length < 4) return;
    triggerHaptic(60);
    setIsSyncing(true);
    setTimeout(() => {
      onUpdateSettings({ 
        ...settings, 
        isGoogleLinked: true, 
        userEmail: emailInput,
        lastSyncTimestamp: Date.now(),
        autoSyncEnabled: true
      });
      setIsSyncing(false);
      setStep('IDLE');
      triggerHaptic(120);
    }, 2000);
  };

  const handleSyncNow = () => {
    if (isSyncing) return;
    triggerHaptic(40);
    setIsSyncing(true);
    setTimeout(() => {
      onUpdateSettings({ ...settings, lastSyncTimestamp: Date.now() });
      setIsSyncing(false);
      triggerHaptic(80);
    }, 1800);
  };

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(150);
    onUpdateSettings({ 
      ...settings, 
      isGoogleLinked: false, 
      userEmail: undefined,
      lastSyncTimestamp: undefined,
      autoSyncEnabled: false
    });
    setEmailInput('');
    setVerifyCode('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-[95%] max-w-md rounded-[2.5rem] shadow-2xl animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5">
              <Sliders className={theme.textAccent} size={20} />
            </div>
            <h3 className={`text-lg font-black ${theme.textAccent}`}>{t.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-all opacity-40 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {step === 'IDLE' && (
            <div className="grid grid-cols-1 gap-3">
              <button onClick={toggleVibration} className={`flex items-center justify-between p-5 rounded-3xl transition-all ${settings.vibrationEnabled ? 'bg-[#e6b94d]/10 border-[#e6b94d]/30' : 'bg-white/5 border-white/5'} border`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${settings.vibrationEnabled ? 'bg-[#e6b94d]/20' : 'bg-white/5'}`}>
                    <Smartphone size={20} className={settings.vibrationEnabled ? 'text-[#e6b94d]' : 'opacity-30'} />
                  </div>
                  <span className={`text-xs font-black ${settings.vibrationEnabled ? theme.displayText : 'opacity-40'}`}>{t.vibration}</span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-all ${settings.vibrationEnabled ? 'bg-[#e6b94d]' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.vibrationEnabled ? (lang === 'ar' ? 'right-6' : 'left-6') : (lang === 'ar' ? 'right-1' : 'left-1')}`} />
                </div>
              </button>

              <button onClick={toggleSound} className={`flex items-center justify-between p-5 rounded-3xl transition-all ${settings.soundEnabled ? 'bg-[#e6b94d]/10 border-[#e6b94d]/30' : 'bg-white/5 border-white/5'} border`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${settings.soundEnabled ? 'bg-[#e6b94d]/20' : 'bg-white/5'}`}>
                    <Volume2 size={20} className={settings.soundEnabled ? 'text-[#e6b94d]' : 'opacity-30'} />
                  </div>
                  <span className={`text-xs font-black ${settings.soundEnabled ? theme.displayText : 'opacity-40'}`}>{t.sound}</span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-all ${settings.soundEnabled ? 'bg-[#e6b94d]' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? (lang === 'ar' ? 'right-6' : 'left-6') : (lang === 'ar' ? 'right-1' : 'left-1')}`} />
                </div>
              </button>
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 px-2 opacity-40">
              <Cloud size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.cloudSync}</span>
            </div>

            <div className={`p-6 rounded-[2.5rem] bg-black/30 border border-white/5 shadow-inner relative overflow-hidden flex flex-col justify-center min-h-[180px]`}>
              {!settings.isGoogleLinked ? (
                <>
                  {step === 'IDLE' && (
                    <div className="space-y-4 animate-modal">
                      <p className="text-[11px] font-bold opacity-40 leading-relaxed">{t.syncDesc}</p>
                      <button onClick={handleStartLinking} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-black text-xs shadow-xl active:scale-95 transition-all">
                        <Cloud size={18} /> {t.linkGoogle}
                      </button>
                    </div>
                  )}
                  {step === 'EMAIL' && (
                    <div className="space-y-4 animate-modal">
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setStep('IDLE')} className="p-1 rounded-lg bg-white/5">{lang === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}</button>
                        <span className="text-[10px] font-black uppercase opacity-60">{t.enterEmail}</span>
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                        <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={t.emailPlaceholder} className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#e6b94d]/50 transition-all ${theme.displayText}`} dir="ltr" />
                      </div>
                      <button onClick={handleSendCode} disabled={isSyncing || !emailInput.includes('@')} className="w-full py-4 rounded-2xl bg-[#e6b94d] text-black font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                        {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {isSyncing ? t.syncing : t.sendCode}
                      </button>
                    </div>
                  )}
                  {step === 'VERIFY' && (
                    <div className="space-y-4 animate-modal">
                      <div className="text-center space-y-2 mb-2">
                        <KeyRound size={24} className="mx-auto text-[#e6b94d]" />
                        <h4 className="text-xs font-black uppercase">{t.verifyTitle}</h4>
                        <p className="text-[9px] font-bold opacity-40 px-4">{t.verifyDesc}</p>
                      </div>
                      <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder={t.codePlaceholder} className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#e6b94d]/50 transition-all ${theme.displayText}`} dir="ltr" />
                      <button onClick={handleVerifyAndLink} disabled={isSyncing || verifyCode.length < 4} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                        {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {isSyncing ? t.syncing : t.confirmCode}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-5 animate-modal">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><Mail size={18} className="text-emerald-500" /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{t.linkedAs}</span><span className="text-xs font-bold truncate max-w-[180px]">{settings.userEmail}</span></div>
                    </div>
                    <button onClick={handleUnlink} className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 bg-red-500/5 px-2 py-1 rounded-lg">{t.unlink}</button>
                  </div>
                  <div className={`p-4 rounded-2xl flex items-center justify-between ${settings.autoSyncEnabled ? 'bg-[#e6b94d]/5 border border-[#e6b94d]/10' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-3"><Zap size={14} className={settings.autoSyncEnabled ? 'text-[#e6b94d]' : 'opacity-20'} /><span className="text-[11px] font-bold opacity-70">{t.autoSync}</span></div>
                    <button onClick={toggleAutoSync} className="p-1">{settings.autoSyncEnabled ? <ToggleRight className="text-[#e6b94d]" size={28} /> : <ToggleLeft className="opacity-20" size={28} />}</button>
                  </div>
                  <div className="space-y-3">
                    <button onClick={handleSyncNow} disabled={isSyncing} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all active:scale-95 ${isSyncing ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#e6b94d] text-black border-[#e6b94d] shadow-lg'}`}>
                      {isSyncing ? <><RefreshCw size={18} className="animate-spin text-emerald-500" /><span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{t.syncing}</span></> : <><RefreshCw size={18} /><span className="text-xs font-black uppercase tracking-widest">{t.syncNow}</span></>}
                    </button>
                    <div className="flex items-center justify-between px-2"><div className="flex items-center gap-1.5 opacity-30"><CheckCircle2 size={10} /><span className="text-[9px] font-bold">{t.lastSync}</span></div><span className="text-[9px] font-mono opacity-40">{settings.lastSyncTimestamp ? new Date(settings.lastSyncTimestamp).toLocaleString() : '--'}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 bg-black/20 shrink-0 flex justify-center">
             <button onClick={onClose} className={`px-12 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] ${theme.equal} ${theme.equalText} shadow-xl active:scale-95 transition-all`}>{t.done}</button>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
};

export default CustomizationModal;
