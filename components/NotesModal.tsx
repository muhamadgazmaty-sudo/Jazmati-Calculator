
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NoteItem, ThemeColors, Language } from '../types';
import { saveNote, getAllNotes, deleteNote, clearAllNotes } from '../database';
import { X, Plus, Trash2, Copy, Check, ArrowLeft, Loader2, Search, NotebookPen, Calendar } from 'lucide-react';

const triggerHaptic = (ms = 40) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

interface NotesModalProps {
  theme: ThemeColors;
  lang: Language;
  onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ theme, lang, onClose }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debounceTimerRef = useRef<number | null>(null);

  const fetchNotes = useCallback(async () => {
    const data = await getAllNotes();
    setNotes(data);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!editingNote) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    if (!editingNote.title.trim() && !editingNote.content.trim()) return;

    setIsSaving(true);
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        await saveNote({
          ...editingNote,
          timestamp: Date.now(),
        });
        await fetchNotes();
        setIsSaving(false);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [editingNote?.title, editingNote?.content, fetchNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleAddNew = () => {
    triggerHaptic(60);
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: '',
      content: '',
      timestamp: Date.now(),
    };
    setEditingNote(newNote);
  };

  const handleEdit = (note: NoteItem) => {
    triggerHaptic(40);
    setEditingNote(note);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    triggerHaptic(70);
    try {
      await deleteNote(id);
      if (editingNote?.id === id) {
        setEditingNote(null);
      }
      await fetchNotes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleClearAll = async () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف جميع الملاحظات؟' : 'Are you sure you want to delete all notes?')) {
      triggerHaptic(100);
      await clearAllNotes();
      setNotes([]);
      setEditingNote(null);
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    triggerHaptic(50);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const t = {
    ar: {
      title: 'مذكرة جزماتي',
      add: 'إضافة ملاحظة',
      back: 'رجوع',
      empty: 'لا توجد ملاحظات',
      titleLabel: 'العنوان...',
      contentLabel: 'اكتب هنا...',
      saving: 'جاري الحفظ...',
      saved: 'تم الحفظ',
      searchPlaceholder: 'بحث...',
      clearAll: 'حذف الكل'
    },
    en: {
      title: 'Jazmati Notes',
      add: 'Add Note',
      back: 'Back',
      empty: 'No notes found',
      titleLabel: 'Title...',
      contentLabel: 'Write here...',
      saving: 'Saving...',
      saved: 'Saved',
      searchPlaceholder: 'Search...',
      clearAll: 'Clear All'
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={() => { triggerHaptic(30); onClose(); }} />
      <div className={`relative w-[95%] max-w-lg h-[80vh] flex flex-col rounded-[2.5rem] shadow-2xl animate-modal overflow-hidden ${theme.card} border ${theme.gridBorder}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            {editingNote ? (
              <button onClick={() => { triggerHaptic(40); setEditingNote(null); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <ArrowLeft size={20} className={theme.displayText} />
              </button>
            ) : (
              <NotebookPen className={theme.textAccent} size={22} />
            )}
            <h3 className={`text-lg font-black ${theme.textAccent}`}>{editingNote ? t.back : t.title}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {editingNote && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                {isSaving ? <Loader2 size={12} className="animate-spin opacity-40" /> : <Check size={12} className="text-emerald-500" />}
                <span className="text-[10px] font-bold opacity-40">{isSaving ? t.saving : t.saved}</span>
              </div>
            )}
            {!editingNote && notes.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                title={t.clearAll}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={() => { triggerHaptic(30); onClose(); }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <X size={20} className="opacity-50" />
            </button>
          </div>
        </div>

        {/* Search */}
        {!editingNote && notes.length > 0 && (
          <div className="px-6 pt-4">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${theme.gridBg} border border-white/5`}>
              <Search size={16} className="opacity-30" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-none outline-none text-sm font-bold"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {editingNote ? (
            <div className="h-full flex flex-col space-y-4">
              <input 
                type="text" 
                placeholder={t.titleLabel}
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className={`w-full bg-transparent border-b border-white/10 py-2 outline-none font-black text-xl ${theme.displayText}`}
              />
              <textarea 
                placeholder={t.contentLabel}
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className={`w-full flex-1 bg-transparent outline-none resize-none ${theme.displayText} opacity-80 text-sm py-2`}
                dir="auto"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center">
                  <NotebookPen size={48} className="mb-4" />
                  <p className="font-bold">{t.empty}</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleEdit(note)}
                    className={`p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group active:scale-[0.98] shadow-sm`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-black text-sm truncate flex-1 ${theme.displayText}`}>{note.title || '...'}</h4>
                      <div className="flex gap-2 shrink-0 ml-4">
                        <button 
                          onClick={(e) => handleCopy(e, note.content, note.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                        >
                          {copiedId === note.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="opacity-40" />}
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, note.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs opacity-40 line-clamp-2 overflow-hidden">{note.content}</p>
                    <div className="mt-3 flex items-center gap-1 opacity-20 text-[9px] font-black uppercase tracking-widest">
                      <Calendar size={10} />
                      {new Date(note.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!editingNote && (
          <div className="p-6 bg-black/20 border-t border-white/10">
            <button 
              onClick={handleAddNew}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${theme.equal} ${theme.equalText}`}
            >
              <Plus size={18} /> {t.add}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModal;
