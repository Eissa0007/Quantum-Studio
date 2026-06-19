import { Shapes, Type, Image as LucideImage, LayoutTemplate, Star, FolderOpen, Grid, Box, Sparkles, ShoppingBag, ShieldUser, History } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthProvider';

export const QuantumSidebar = () => {
  const { activePanel, setActivePanel } = useStore();
  const { isAdmin } = useAuth();
  
  const navItems = [
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'uploads', icon: FolderOpen, label: 'Uploads' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: '3d', icon: Box, label: '3D Studio' },
    { id: 'ai', icon: Sparkles, label: 'Quantum AI' },
    { id: 'projects', icon: Grid, label: 'Projects' },
    { id: 'ecommerce', icon: ShoppingBag, label: 'Store' },
    { id: 'apps', icon: Star, label: 'Apps' },
    { id: 'history', icon: History, label: 'History' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', icon: ShieldUser, label: 'Admin' });
  }

  return (
    <nav className="w-full md:w-[72px] h-[64px] md:h-auto order-last md:order-first bg-white dark:bg-[#1A1A2E] border-t md:border-t-0 md:border-r border-[rgba(0,0,0,0.08)] dark:border-gray-800 flex flex-row md:flex-col items-center md:pt-4 gap-2 md:gap-5 z-20 overflow-x-auto overflow-y-hidden md:overflow-visible scrollbar-hide px-2 md:px-0">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePanel(item.id)}
          className={`flex-shrink-0 flex flex-col items-center justify-center w-[60px] md:w-12 h-12 md:rounded-xl transition-colors cursor-pointer text-[10px] ${
            activePanel === item.id 
              ? 'bg-[#00C4CC]/10 text-[#00C4CC]' 
              : 'text-[#666] hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <item.icon size={20} className="mb-0.5" />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
