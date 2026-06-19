import { useState } from 'react';
import { useHistoryStore } from '../store/useHistoryStore';
import { useStore } from '../store/useStore';
import { 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  FileJson,
  X,
  PlusCircle,
  Pencil,
  MinusCircle,
  FileText
} from 'lucide-react';

export const HistoryPanel = ({ onClose }: { onClose?: () => void }) => {
  const { 
    history, 
    currentIndex, 
    undo, 
    redo, 
    jumpToHistory, 
    clearHistory,
    lang,
    setLang
  } = useHistoryStore();
  const { fabricCanvas } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "canvas_history.json");
    dlAnchorElem.click();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'add': return <PlusCircle size={14} className="text-emerald-500" />;
      case 'modify': return <Pencil size={14} className="text-blue-500" />;
      case 'remove': return <MinusCircle size={14} className="text-red-500" />;
      case 'clear': return <Trash2 size={14} className="text-orange-500" />;
      default: return <FileText size={14} className="text-gray-500" />;
    }
  };

  const filteredHistory = history.map((item, idx) => ({ ...item, originalIndex: idx }))
    .filter(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .reverse();

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white dark:bg-[#1A1A2E]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4 border-b border-[rgba(0,0,0,0.08)] dark:border-gray-800 pb-2">
         <div className="flex items-center gap-2">
           <h3 className="text-sm font-bold text-gray-800 dark:text-white">
             {lang === 'ar' ? 'سجل التغييرات' : 'History'}
           </h3>
           <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 rounded-full text-[10px] font-bold">
             {history.length}/100
           </span>
         </div>
         <div className="flex items-center gap-2">
           <button 
             onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
             className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
           >
             {lang === 'ar' ? 'EN' : 'AR'}
           </button>
           {onClose && (
             <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
               <X size={14} />
             </button>
           )}
         </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => undo(fabricCanvas)} 
          disabled={currentIndex <= 0}
          className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-xl text-xs font-bold transition-colors ${currentIndex <= 0 ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          <RotateCcw size={14} /> {lang === 'ar' ? 'تراجع' : 'Undo'}
        </button>
        <button 
          onClick={() => redo(fabricCanvas)}
          disabled={currentIndex >= history.length - 1}
          className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-xl text-xs font-bold transition-colors ${currentIndex >= history.length - 1 ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          <RotateCw size={14} /> {lang === 'ar' ? 'إعادة' : 'Redo'}
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'}
          className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#00C4CC]"
        />
        
        <div className="flex gap-2">
           <button onClick={handleExport} className="flex-1 text-[10px] text-gray-500 hover:text-[#00C4CC] border border-gray-200 dark:border-gray-800 p-1.5 rounded-lg flex items-center justify-center gap-1">
             <FileJson size={12} /> {lang === 'ar' ? 'تصدير JSON' : 'Export JSON'}
           </button>
           <button onClick={() => { if(confirm(lang==='ar'?'هل أنت متأكد من المسح؟':'Are you sure?')) clearHistory(); }} className="text-[10px] text-red-500 hover:text-red-600 border border-red-100 dark:border-red-900/30 p-1.5 rounded-lg flex items-center justify-center">
             <Trash2 size={12} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
         {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-8">
              {lang === 'ar' ? 'لا يوجد سجل مطابق' : 'No history found'}
            </div>
         ) : null}
         {filteredHistory.map((item) => (
           <div 
             key={item.id}
             onClick={() => jumpToHistory(item.originalIndex, fabricCanvas)}
             className={`relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
               item.originalIndex === currentIndex 
                 ? 'bg-[#00C4CC]/10 border-[#00C4CC]/30 shadow-sm' 
                 : item.originalIndex > currentIndex
                 ? 'bg-transparent border-transparent opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                 : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-[#00C4CC]/30 hover:shadow-sm'
             }`}
           >
             <div className="flex items-center gap-3">
               <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0 ${item.originalIndex === currentIndex ? 'bg-white dark:bg-gray-900' : ''}`}>
                 {getIcon(item.type)}
               </div>
               <div>
                  <p className={`text-xs font-bold ${item.originalIndex === currentIndex ? 'text-[#00C4CC]' : 'text-gray-700 dark:text-gray-200'}`}>
                    {item.description}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
               </div>
             </div>
             
             {item.originalIndex === currentIndex && (
               <div className="w-2 h-2 rounded-full bg-[#00C4CC] shadow-[0_0_8px_rgba(0,196,204,0.6)] animate-pulse" />
             )}
           </div>
         ))}
      </div>
    </div>
  );
};
