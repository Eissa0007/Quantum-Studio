import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { ShieldUser, Search, Loader2, AlertCircle, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { seedAdmins, removeAdminRole, getAllAdmins } from '../utils/adminSeeder';

export const AdminSetupPage = () => {
  const { user } = useAuth();
  const [emailsRaw, setEmailsRaw] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error'|'info', message: string} | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    const data = await getAllAdmins();
    setAdmins(data);
    setLoading(false);
  };

  const handleAddAdmins = async () => {
    const rawList = emailsRaw.split(/[,\n]/).map(e => e.trim()).filter(e => e.length > 0);
    if (rawList.length === 0) {
      setStatus({ type: 'error', message: 'يرجى إدخال إيميل واحد على الأقل' });
      return;
    }

    setActionLoading(true);
    setStatus(null);
    try {
      const results = await seedAdmins(rawList, user?.uid || 'unknown');
      setStatus({ 
        type: results.failedCount > 0 && results.addedCount === 0 ? 'error' : 'success', 
        message: `تمت الإضافة: ${results.addedCount} | تم التخطي: ${results.skippedCount} | فشل: ${results.failedCount}` 
      });
      setEmailsRaw('');
      loadAdmins();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'حدث خطأ غير معروف' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف صلاحية المشرف من ${email}؟`)) return;
    
    setActionLoading(true);
    const success = await removeAdminRole(email, user?.uid || 'unknown');
    if (success) {
      setStatus({ type: 'success', message: `تم حذف ${email} بنجاح` });
      loadAdmins();
    } else {
      setStatus({ type: 'error', message: `فشل حذف ${email}` });
    }
    setActionLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0B0F19] p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldUser size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إعدادات المشرفين</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">إضافة وإدارة صلاحيات المشرفين في النظام</p>
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300' :
            status.type === 'error' ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300' :
            'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-semibold">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Add Form */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <UserPlus size={20} className="text-indigo-500" />
                إضافة مشرفين
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                أدخل البريد الإلكتروني للمسؤولين الجدد (يمكنك إضافة عدة إيميلات مفصولة بفاصلة أو سطر جديد).
              </p>
              <textarea
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                placeholder="example1@gmail.com&#10;example2@gmail.com"
                className="w-full h-32 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none mb-4"
              ></textarea>
              <button
                onClick={handleAddAdmins}
                disabled={actionLoading || !emailsRaw.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldUser size={20} />}
                منح الصلاحيات
              </button>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <ShieldUser size={20} className="text-cyan-500" />
                  المشرفين الحاليين ({admins.length})
                </h2>
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="بحث المشرفين..." className="bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-lg py-2 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white w-64" />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">لا يوجد مشرفين</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                        <th className="py-3 px-4 font-semibold">البريد الإلكتروني</th>
                        <th className="py-3 px-4 font-semibold">الدور</th>
                        <th className="py-3 px-4 font-semibold">حالة الحساب</th>
                        <th className="py-3 px-4 font-semibold text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800 dark:text-white">{admin.email}</div>
                            <div className="text-xs text-gray-400">UID: {admin.user_id.substring(0,10)}...</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md uppercase">
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${admin.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                              {admin.is_active ? 'نشط' : 'موقوف'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => handleRemove(admin.email)}
                              disabled={admin.email === user?.email}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-20"
                              title={admin.email === user?.email ? "لا يمكنك حذف نفسك" : "حذف الصلاحية"}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
