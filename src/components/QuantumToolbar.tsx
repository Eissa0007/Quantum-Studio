import {
  Download,
  Share2,
  Undo2,
  Redo2,
  Eye,
  Users,
  Cloud,
  CloudOff,
  Loader2,
  CloudLightning,
  LogOut,
  LogIn,
  Shield,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { ConnectionStatus } from "./ConnectionStatus";
import { useState } from "react";
import { ExportModal } from "./ExportModal";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { navigateTo } from "../utils/navigation";

export const QuantumToolbar = () => {
  const { currentProject, saveStatus, isConnected, setShowLoginModal, showExportModal, setShowExportModal } =
    useStore();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="h-[56px] bg-white dark:bg-[#1A1A2E] border-b border-[rgba(0,0,0,0.08)] dark:border-gray-800 flex items-center justify-between px-2 md:px-5 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2 md:gap-2.5 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C4CC] to-[#7D3CFF] flex items-center justify-center text-white font-bold text-xl cursor-pointer" onClick={() => navigateTo('/')}>
            Q
          </div>
          <span className="hidden sm:inline cursor-pointer" onClick={() => navigateTo('/')}>Quantum Studio</span>
        </div>
        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
        <div className="flex items-center gap-2 overflow-hidden">
          <input
            type="text"
            value={currentProject?.title || "Untitled Design"}
            readOnly
            className="w-24 md:w-auto font-medium text-sm text-gray-800 dark:text-white bg-transparent border-none outline-none cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded truncate"
          />
          <span className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00C4CC]/10 text-[#00C4CC]">
            Draft
          </span>
        </div>

        <ConnectionStatus />

        {isConnected && (
          <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 font-medium">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={14} className="animate-spin" /> جاري الحفظ...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Cloud size={14} className="text-green-500" /> تم الحفظ
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudLightning size={14} className="text-red-500" /> فشل الحفظ
              </>
            )}
            {saveStatus === "idle" && (
              <>
                <Cloud size={14} /> محفوظ في السحابة
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="hidden sm:flex mr-3">
          <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A2E] bg-[#FF6B9D] z-10" />
          <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A2E] -ml-2 bg-[#7D3CFF] z-20" />
          <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1A1A2E] -ml-2 bg-[#00C4CC] z-30" />
        </div>
        
        <button
          onClick={() => navigateTo('/env-checker')}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#00C4CC] border border-gray-200 dark:border-gray-700 hover:border-[#00C4CC]/30 bg-gray-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          title="فحص متغيرات البيئة"
        >
          <Shield size={14} className="text-[#00C4CC]" />
          <span className="hidden md:inline">فحص البيئة 🔍</span>
        </button>

        <button
          onClick={() => useStore.getState().setShowAuditDashboard(true)}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#8b5cf6] border border-gray-200 dark:border-gray-700 hover:border-[#8b5cf6]/30 bg-gray-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          title="افتح لوحة التدقيق"
        >
          <span className="text-[#8b5cf6] font-bold">📊</span>
          <span className="hidden md:inline">لوحة التدقيق 💡</span>
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 bg-[#00C4CC] hover:bg-[#00b0b8] text-white px-3 md:px-4 py-2 rounded-md font-semibold text-sm transition-colors border-none cursor-pointer"
        >
          <span className="hidden md:inline">Share & Export</span>
          <span className="md:hidden">Export</span>
        </button>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />
        {user ? (
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="p-2 text-gray-500 hover:text-[#00C4CC] hover:bg-[#00C4CC]/10 rounded-lg transition-colors"
            title="تسجيل الدخول"
          >
            <LogIn size={18} />
          </button>
        )}
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </header>
  );
};
