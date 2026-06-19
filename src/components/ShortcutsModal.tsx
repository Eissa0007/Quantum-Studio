import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Keyboard, Save } from 'lucide-react';

const defaultShortcuts = {
  save: 's',
  undo: 'z',
  redo: 'y',
  copy: 'c',
  paste: 'v',
  duplicate: 'd',
  selectAll: 'a',
  group: 'g',
  export: 'e'
};

export const ShortcutsModal = () => {
  const { showShortcutsModal, setShowShortcutsModal } = useStore();
  const [lang, setLang] = useState<'ar'|'en'>('ar');
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quantum_shortcuts');
      if (saved) {
        setShortcuts({ ...defaultShortcuts, ...JSON.parse(saved) });
      }
    } catch(err) {}
  }, []);

  const saveShortcuts = (newShortcuts: any) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('quantum_shortcuts', JSON.stringify(newShortcuts));
  };

  const handleUpdateKey = (keyName: string, newKey: string) => {
    // Conflict detection
    if (Object.values(shortcuts).includes(newKey) && shortcuts[keyName as keyof typeof shortcuts] !== newKey) {
       alert(lang === 'ar' ? 'هذا الاختصار مستخدم بالفعل!' : 'Shortcut already in use!');
       return;
    }
    
    const updated = { ...shortcuts, [keyName]: newKey.toLowerCase() };
    saveShortcuts(updated);
    setEditingKey(null);
    
    // Also dispatch event or reload to update runtime shortcuts, but user could just reload for ease or since we fetch it from localStorage inside keyboardShortcuts, wait, keyboardShortcuts fetches on setup. So a reload is recommended or we can trigger a custom event.
    window.location.reload(); 
  };

  if (!showShortcutsModal) return null;

  const t = {
    title: lang === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts',
    langToggle: lang === 'ar' ? 'EN' : 'AR',
    action: lang === 'ar' ? 'الإجراء' : 'Action',
    shortcut: lang === 'ar' ? 'الاختصار' : 'Shortcut',
    save: lang === 'ar' ? 'حفظ المشروع' : 'Save Project',
    undo: lang === 'ar' ? 'تراجع' : 'Undo',
    redo: lang === 'ar' ? 'إعادة' : 'Redo',
    copy: lang === 'ar' ? 'نسخ' : 'Copy',
    paste: lang === 'ar' ? 'لصق' : 'Paste',
    duplicate: lang === 'ar' ? 'تكرار' : 'Duplicate',
    selectAll: lang === 'ar' ? 'تحديد الكل' : 'Select All',
    group: lang === 'ar' ? 'تجميع/فك' : 'Group/Ungroup',
    export: lang === 'ar' ? 'تصدير' : 'Export',
    deleteTxt: lang === 'ar' ? 'حذف العنصر' : 'Delete Element',
    panTxt: lang === 'ar' ? 'سحب اللوحة' : 'Pan Canvas',
    zoomTxt: lang === 'ar' ? 'تكبير / تصغير' : 'Zoom In / Out',
    resetTxt: lang === 'ar' ? 'إعادة التكبير' : 'Reset Zoom',
    fsTxt: lang === 'ar' ? 'ملء الشاشة' : 'Fullscreen',
    sysConfig: lang === 'ar' ? 'ثوابت النظام (لا يمكن تعديلها)' : 'System Defaults (Read-only)'
  };

  const modifier = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl + ';

  const editableKeys = [
    { key: 'save', label: t.save },
    { key: 'undo', label: t.undo },
    { key: 'redo', label: t.redo },
    { key: 'copy', label: t.copy },
    { key: 'paste', label: t.paste },
    { key: 'duplicate', label: t.duplicate },
    { key: 'selectAll', label: t.selectAll },
    { key: 'group', label: t.group },
    { key: 'export', label: t.export },
  ];

  return (
    <div className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1A1A2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
              <Keyboard size={20} />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-xs font-bold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t.langToggle}
            </button>
            <button 
              onClick={() => setShowShortcutsModal(false)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 text-gray-700 dark:text-gray-300">
          
          <div className="mb-6">
             <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400 uppercase mb-3 px-2">
               <div>{t.action}</div>
               <div>{t.shortcut}</div>
             </div>
             
             <div className="space-y-2">
                {editableKeys.map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl group hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                     <span className="text-sm font-semibold">{item.label}</span>
                     <div>
                       {editingKey === item.key ? (
                         <input 
                           autoFocus
                           className="w-20 text-center font-mono text-sm p-1 rounded border border-purple-500 bg-white dark:bg-gray-900 outline-none uppercase"
                           maxLength={1}
                           onKeyDown={(e) => {
                             if(e.key.match(/^[a-zA-Z]$/)) handleUpdateKey(item.key, e.key);
                             if(e.key === 'Escape') setEditingKey(null);
                           }}
                           onBlur={() => setEditingKey(null)}
                         />
                       ) : (
                         <button 
                           onClick={() => setEditingKey(item.key)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm font-mono text-sm hover:border-purple-500 transition-colors group-hover:text-purple-600"
                           title="Click to edit"
                         >
                           <span className="text-gray-400">{modifier}</span> 
                           <span className="font-bold uppercase">{shortcuts[item.key as keyof typeof shortcuts]}</span>
                         </button>
                       )}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div>
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-2 mt-8">{t.sysConfig}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <SysRow label={t.deleteTxt} val="Delete / Backspace" />
                <SysRow label={t.panTxt} val="Alt + Drag" />
                <SysRow label={t.zoomTxt} val="Ctrl + Scroll / +/-" />
                <SysRow label={t.resetTxt} val={modifier + "0"} />
                <SysRow label={t.fsTxt} val="F11" />
                <SysRow label="Shortcuts Guide" val="?" />
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const SysRow = ({ label, val }: { label: string, val: string }) => (
   <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl opacity-70">
      <span className="text-sm font-medium">{label}</span>
      <span className="font-mono text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{val}</span>
   </div>
);
