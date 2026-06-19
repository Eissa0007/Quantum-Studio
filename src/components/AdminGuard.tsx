import React from 'react';
import { useAuth } from './AuthProvider';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const AdminGuard = ({ children, requiredRole = 'admin' }: { children: React.ReactNode, requiredRole?: 'admin' | 'editor' | 'viewer' }) => {
  const { user, loading, role, isAdmin, isEditor } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F5] dark:bg-[#0F1419]">
        <Loader2 className="animate-spin text-[#00C4CC]" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-4 text-center pb-20 mt-12 z-50">
        <ShieldAlert className="text-[#00C4CC] mb-6" size={80} />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">يجب تسجيل الدخول</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg mb-8">
          يرجى تسجيل الدخول للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  const isAuthorized = 
    requiredRole === 'admin' ? isAdmin :
    requiredRole === 'editor' ? isEditor : 
    true;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F5F5F5] dark:bg-[#0F1419] p-4 text-center pb-20 mt-12 z-50">
        <ShieldAlert className="text-red-500 mb-6" size={80} />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">غير مصرح لك</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg mb-8">
          ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التواصل مع مسؤول النظام إذا كنت تعتقد أن هذا خطأ.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
