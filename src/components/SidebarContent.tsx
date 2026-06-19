import { useStore } from '../store/useStore';
import { QuantumElementsPanel } from './QuantumElementsPanel';
import { QuantumTemplatesPanel } from './QuantumTemplatesPanel';
import { QuantumUploadsPanel } from './QuantumUploadsPanel';
import { QuantumTextPanel } from './QuantumTextPanel';
import { Quantum3DPanel } from './Quantum3DPanel';
import { QuantumAIPanel } from './QuantumAIPanel';
import { QuantumStorePanel } from './QuantumStorePanel';
import { QuantumPluginMarketplace } from './QuantumPluginMarketplace';
import { QuantumAdminPanel } from './QuantumAdminPanel';
import { HistoryPanel } from './HistoryPanel';

export const SidebarContent = () => {
  const { activePanel } = useStore();
  
  return (
    <aside className="w-full md:w-[320px] absolute md:relative z-40 h-[calc(100%-4rem)] md:h-full bg-white dark:bg-[#1A1A2E] border-r border-[rgba(0,0,0,0.08)] dark:border-gray-800 flex flex-col shadow-2xl md:shadow-none shadow-black/20 pb-[env(safe-area-inset-bottom)] md:pb-0">
      <div className="p-4 font-semibold border-b border-[rgba(0,0,0,0.08)] dark:border-gray-800 text-gray-800 dark:text-white capitalize text-sm flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <span>{activePanel}</span>
        <button className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-800" onClick={() => useStore.getState().setActivePanel('none')}>
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {activePanel === 'elements' && <QuantumElementsPanel />}
      {activePanel === 'templates' && <QuantumTemplatesPanel />}
      {activePanel === 'uploads' && <QuantumUploadsPanel />}
      {activePanel === 'text' && <QuantumTextPanel />}
      {activePanel === '3d' && <Quantum3DPanel />}
      {activePanel === 'ai' && <QuantumAIPanel />}
      {activePanel === 'ecommerce' && <QuantumStorePanel />}
      {activePanel === 'apps' && <QuantumPluginMarketplace />}
      {activePanel === 'admin' && <QuantumAdminPanel />}
      {activePanel === 'history' && <HistoryPanel />}

      {activePanel === 'none' && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900/40 mb-4 flex items-center justify-center text-[#00C4CC]">
             <span className="text-xl">🖌️</span>
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">مرحباً في كوانتوم ستوديو</p>
          <p className="text-xs text-gray-500">اختر أداة من شريط التنقل الجانبي لضبط وتخطيط مشروعك الإبداعي.</p>
        </div>
      )}
    </aside>
  );
};
