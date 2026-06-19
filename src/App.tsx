/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { QuantumSidebar } from "./components/QuantumSidebar";
import { QuantumToolbar } from "./components/QuantumToolbar";
import { SidebarContent } from "./components/SidebarContent";
import { QuantumCanvas } from "./components/QuantumCanvas";
import { QuantumPropertiesPanel } from "./components/QuantumPropertiesPanel";
import { QuantumPagesPanel } from "./components/QuantumPagesPanel";
import { QuantumProjectsView } from "./components/QuantumProjectsView";
import { useStore } from "./store/useStore";
import { checkSupabaseConnection } from "./lib/supabase";
import { useRealtimeSync } from "./utils/realtimeSync";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { seedTemplatesIfEmpty } from "./utils/templateSeeder";
import { AdminSetupPage } from "./components/AdminSetupPage";
import { AdminGuard } from "./components/AdminGuard";
import { FirstTimeSetup } from "./components/FirstTimeSetup";
import { AIAssistant } from "./components/AIAssistant";
import { ShortcutsModal } from "./components/ShortcutsModal";

// Step 6 & 3 integration Imports
import { initializeDiagnosticsConsole } from "./utils/diagnostics";
import { checkAllEnvVars } from "./utils/envChecker";
import { EnvVariablesChecker } from "./components/EnvVariablesChecker";
import { EnvSetupGuide } from "./components/EnvSetupGuide";
import { AlertCircle, ArrowLeft, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { navigateTo } from "./utils/navigation";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";

export default function App() {
  const { setIsConnected, activePanel, showAuditDashboard, setShowAuditDashboard } = useStore();
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [missingVarsList, setMissingVarsList] = useState<string[]>([]);
  
  useRealtimeSync();

  // Handle client-side routing state
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    
    // Initialize standard console validation right away
    initializeDiagnosticsConsole();
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Check variables on app render
  useEffect(() => {
    const varsResult = checkAllEnvVars();
    const criticalMissing = varsResult
      .filter((v) => !v.isSet || !v.isValid)
      .map((v) => v.name);

    const wasDismissed = sessionStorage.getItem("env_warning_dismissed");
    
    if (criticalMissing.length > 0 && !wasDismissed) {
      setMissingVarsList(criticalMissing);
      setShowWarningModal(true);
    }
  }, []);

  useEffect(() => {
    const initDb = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      if (connected) {
        await seedTemplatesIfEmpty();
      }
    };
    initDb();
  }, [setIsConnected]);

  const dismissWarning = () => {
    sessionStorage.setItem("env_warning_dismissed", "true");
    setShowWarningModal(false);
  };

  // Route: /env-checker
  if (currentPath === "/env-checker") {
    return (
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <header className="h-[56px] px-6 bg-white dark:bg-[#1A1A2E] border-b border-[rgba(0,0,0,0.08)] dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-lg cursor-pointer" onClick={() => navigateTo("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C4CC] to-[#7D3CFF] flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span>Quantum Studio</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigateTo("/env-guide")}
                className="text-xs font-bold text-[#00C4CC] hover:underline flex items-center gap-1"
              >
                دليل الإعداد 📖
              </button>
              <button
                onClick={() => navigateTo("/")}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                العودة للرئيسية <ArrowRight size={14} />
              </button>
            </div>
          </header>
          <EnvVariablesChecker />
        </div>
      </AuthProvider>
    );
  }

  // Route: /env-guide
  if (currentPath === "/env-guide") {
    return (
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <header className="h-[56px] px-6 bg-white dark:bg-[#1A1A2E] border-b border-[rgba(0,0,0,0.08)] dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-lg cursor-pointer" onClick={() => navigateTo("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C4CC] to-[#7D3CFF] flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span>Quantum Studio</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigateTo("/env-checker")}
                className="text-xs font-bold text-[#00C4CC] hover:underline flex items-center gap-1"
              >
                لوحة فحص المفاتيح 🔍
              </button>
              <button
                onClick={() => navigateTo("/")}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                العودة للرئيسية <ArrowRight size={14} />
              </button>
            </div>
          </header>
          <EnvSetupGuide />
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      {!setupComplete && <FirstTimeSetup onComplete={() => setSetupComplete(true)} />}
      <ProtectedRoute>
        <div className="flex flex-col h-screen w-full bg-[#F5F5F5] dark:bg-[#0F1419] text-[#0F1419] dark:text-white overflow-hidden font-sans">
          <OfflineIndicator />
          <QuantumToolbar />
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            <QuantumSidebar />
            
            {activePanel === 'projects' ? (
              <QuantumProjectsView />
            ) : activePanel === 'admin' ? (
              <AdminGuard requiredRole="admin">
                <AdminSetupPage />
              </AdminGuard>
            ) : (
              <>
                {activePanel !== 'none' && <SidebarContent />}
                <div 
                  className="flex-1 flex flex-col min-w-0 bg-[#E9E9E9] dark:bg-[#121212] relative pb-[60px] md:pb-0" 
                  style={{ backgroundImage: 'radial-gradient(#CCC 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  <QuantumCanvas />
                  <QuantumPagesPanel />
                </div>
                <QuantumPropertiesPanel />
              </>
            )}
          </main>
          <footer className="h-10 bg-white dark:bg-[#1A1A2E] border-t border-[rgba(0,0,0,0.08)] dark:border-gray-800 hidden md:flex items-center px-4 justify-between text-xs text-gray-500 z-50">
            <div>Quantum Studio v7.5.5</div>
            <div className="flex gap-6">
              <span>Scale: 85%</span>
              <span>Pages: 1 / 12</span>
              <span>Saved to Cloud</span>
            </div>
          </footer>

          {/* Validation Warning Modal on Load (Arabic) */}
          {showWarningModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
              <div className="bg-[#1A1A2E] text-white border border-gray-800/80 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative space-y-6">
                
                {/* Visual Header */}
                <div className="flex items-center gap-3 text-amber-400">
                  <ShieldAlert size={36} className="animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold font-sans">تنبيه: متغيرات بيئة غير مكتملة!</h3>
                    <p className="text-xs text-gray-400 mt-0.5">شاشة التشخيص المبكر للأخطاء</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  تم الكشف عن أن بعض مفاتيح الـ API أو متغيرات البيئة الأساسية فارغة أو غير صحيحة للتطبيق وسوف يتم تحويل التشغيل تلقائياً إلى 
                  <strong> "الوضع التجريبي المحاكي" </strong> لضمان عمل الواجهات دون توقف.
                </p>

                {/* List of affected keys */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-gray-400">المفاتيح المتأثرة بالفحص حالياً:</span>
                  <div className="bg-black/35 rounded-2xl p-4 max-h-[140px] overflow-y-auto divide-y divide-gray-800/50 border border-gray-800/40 font-mono text-xs">
                    {missingVarsList.map((v) => (
                      <div key={v} className="py-1.5 flex justify-between items-center text-pink-400">
                        <span>{v}</span>
                        <span className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-md text-[10px] font-bold">غير معرف</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      dismissWarning();
                      navigateTo("/env-checker");
                    }}
                    className="flex items-center justify-center gap-1.5 bg-[#00C4CC] hover:bg-[#00b0b8] text-white font-bold p-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    لوحة فحص المفاتيح 🔍
                  </button>

                  <button
                    onClick={() => {
                      dismissWarning();
                      navigateTo("/env-guide");
                    }}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold p-3 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    دليل الإعداد 📖
                  </button>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-2">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Sparkles size={12} className="text-[#00C4CC]" />
                    الوضع التجريبي الآمن مفعل
                  </span>
                  <button
                    onClick={dismissWarning}
                    className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    متابعة كـ ديمو ➔
                  </button>
                </div>

              </div>
            </div>
          )}

          {showAuditDashboard && (
            <div className="fixed inset-0 z-[10000] bg-black/90">
              <AnalyticsDashboard onClose={() => setShowAuditDashboard(false)} />
            </div>
          )}

          <AIAssistant />
          <ShortcutsModal />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}


