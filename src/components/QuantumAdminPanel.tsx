import { useState } from 'react';
import { Shield, Users, Database, Plus, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { setFeatureStatus } from '../utils/fixTracker';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'pending';
}

export const QuantumAdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'team'>('metrics');
  const [team, setTeam] = useState<TeamMember[]>([
    { id: '1', name: 'أحمد سعيد', email: 'ahmed@quantum.io', role: 'المالك', status: 'active' },
    { id: '2', name: 'سارة خالد', email: 'sara@quantum.io', role: 'مصمم واجهات', status: 'active' },
    { id: '3', name: 'محمد علي', email: 'mohammed@quantum.io', role: 'مطور أول', status: 'pending' },
  ]);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('مصمم');

  // Trigger seeding or resetting DB metrics
  const [dbStatus, setDbStatus] = useState('مستقر ومزامن');
  const [systemLoad, setSystemLoad] = useState('14%');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    setFeatureStatus('admin', 'in-progress');
    const newMember: TeamMember = {
      id: String(team.length + 1),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'pending'
    };

    setTeam([...team, newMember]);
    setInviteName('');
    setInviteEmail('');
    setFeatureStatus('admin', 'fixed');
  };

  const syncDatabase = () => {
    setFeatureStatus('admin', 'in-progress');
    setDbStatus('جاري الفحص وإعادة الفهرسة...');
    setTimeout(() => {
      setDbStatus('مستقر ومزامن بنجاح - تم معالجة 432 سجل');
      setSystemLoad('8%');
      setFeatureStatus('admin', 'fixed');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white dark:bg-[#1A1A2E]" dir="rtl">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-1.5">
          <Shield size={16} className="text-[#8b5cf6]" />
          لوحة الإشراف (Admin Dashboard)
        </h3>
        <p className="text-xs text-gray-500">إدارة الفريق، ومراقبة حالة قواعد البيانات والأنظمة السحابية</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 m-1 rounded-xl text-[11px] font-bold">
        <button 
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-colors ${activeTab === 'metrics' ? 'bg-[#8b5cf6] text-white' : 'text-gray-500'}`}
        >
          أداء خوادم وقواعد البيانات
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-colors ${activeTab === 'team' ? 'bg-[#8b5cf6] text-white' : 'text-gray-500'}`}
        >
          إدارة أعضاء الفريق ({team.length})
        </button>
      </div>

      <div className="h-4" />

      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-transparent flex flex-col justify-between">
            <span className="text-[10px] text-indigo-400 font-bold block mb-1">حالة اتصال قواعد البيانات (Supabase)</span>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-mono font-bold text-emerald-400">{dbStatus}</span>
              <button 
                onClick={syncDatabase}
                className="bg-indigo-500 hover:bg-indigo-600 text-white p-1 rounded-lg transition-transform"
                title="مزامنة"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-55 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-850">
              <span className="text-[10px] text-gray-400 block font-bold">ضغط خوادم الويب</span>
              <span className="text-lg font-bold font-mono text-gray-700 dark:text-white mt-1 block">{systemLoad}</span>
            </div>
            <div className="p-3 bg-gray-55 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-850">
              <span className="text-[10px] text-gray-400 block font-bold">مساحة تخزين الملفات</span>
              <span className="text-lg font-bold font-mono text-gray-700 dark:text-white mt-1 block">24.8 GB</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2.5 text-amber-500 items-start">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>تنبيه الأمان:</strong> تم رصد وصول مجهول من عنوان IP خارجي قبل ساعة. تم عزل وتصفير جلسات الدخول المحاكاة تلقائياً.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-4">
          <form onSubmit={handleAddMember} className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-150 dark:border-gray-850 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
              <Plus size={14} className="text-[#8b5cf6]" />
              دعوة عضو جديد
            </h4>

            <div>
              <input 
                type="text" 
                placeholder="اسم العضو"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs p-2 rounded-lg"
              />
            </div>

            <div>
              <input 
                type="email" 
                placeholder="عنوان البريد الإلكتروني"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs p-2 rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs rounded-lg p-2 flex-1"
              >
                <option value="مصمم">مصمم واجهات</option>
                <option value="مطور">مطور برمجيات</option>
                <option value="محلل">محلل أعمال</option>
              </select>

              <button 
                type="submit" 
                className="bg-[#8b5cf6] hover:bg-[#784fe0] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                إرسال دعوة
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 block font-bold">قائمة الأعضاء الحاليين:</span>
            {team.map(m => (
              <div key={m.id} className="p-3 bg-gray-900/40 border border-transparent rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-white">{m.name}</h4>
                  <span className="text-[9px] text-gray-400">{m.email} • {m.role}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${m.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-500 animate-pulse'}`}>
                  {m.status === 'active' ? 'نشط' : 'قيد الانتظار'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
