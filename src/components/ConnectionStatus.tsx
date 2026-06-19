import { useState, useEffect } from 'react';
import { Cloud, CloudOff, CloudLightning } from 'lucide-react';
import { useStore } from '../store/useStore';
import { checkSupabaseConnection } from '../lib/supabase';

export const ConnectionStatus = () => {
  const { isConnected, setIsConnected } = useStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Initial check
    const checkConn = async () => {
      const conn = await checkSupabaseConnection();
      setIsConnected(conn);
    };
    checkConn();

    // Auto-retry every 10 seconds if failed
    const interval = setInterval(async () => {
      if (!isConnected) {
        checkConn();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected, setIsConnected]);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowModal(!showModal)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
          isConnected ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30'
        }`}
      >
        {isConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
        {isConnected ? 'متصل' : 'غير متصل'}
      </button>

      {showModal && (
        <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-white dark:bg-[#1A1A2E] rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50">
          <h4 className="font-semibold text-sm mb-2 text-gray-800 dark:text-white">حالة الاتصال بالسحابة</h4>
          {isConnected ? (
             <div className="text-xs text-gray-600 dark:text-gray-400">
               <p className="flex items-center gap-1 mb-1 text-green-500"><Cloud size={12}/> متصل بـ Supabase</p>
               <p>جميع التغييرات تُحفظ تلقائياً في السحابة.</p>
             </div>
          ) : (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-1 mb-2 text-red-500"><CloudLightning size={12}/> فشل الاتصال</p>
              <p className="mb-2">يرجى التأكد من إضافة المتغيرات التالية في ملف البيئة (Environment variables):</p>
              <ul className="list-disc pl-4 space-y-1 mb-2 text-red-400 font-mono text-[10px]">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
              <p>ستستخدم التطبيق في وضع عدم الاتصال (Offline mode). سيتم حفظ أعمالك محلياً.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
