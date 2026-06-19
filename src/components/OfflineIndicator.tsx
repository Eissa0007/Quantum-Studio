import { CloudOff } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const OfflineIndicator = () => {
  const { isOnline } = useOfflineSync();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold shadow-md z-[100] sticky top-0">
      <CloudOff size={16} />
      أنت غير متصل - التغييرات محفوظة محلياً
    </div>
  );
};
