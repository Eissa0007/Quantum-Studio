import { useState, useEffect } from 'react';
import { getAuditIssues } from '../utils/fullAudit';
import { getFixProgressSummary, logFixProgressConsole } from '../utils/fixTracker';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Download, 
  Globe, 
  BadgeAlert, 
  RefreshCw, 
  Code2, 
  Settings, 
  Boxes,
  Activity,
  Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const AuditDashboard = ({ onClose }: { onClose?: () => void }) => {
  const [issues, setIssues] = useState(getAuditIssues());
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'visual_report'>('table');

  // Trigger state updates when a feature status changes
  useEffect(() => {
    const handleStatusChange = () => {
      setIssues(getAuditIssues());
    };
    window.addEventListener('quantum-feature-status-changed', handleStatusChange);
    return () => {
      window.removeEventListener('quantum-feature-status-changed', handleStatusChange);
    };
  }, []);

  const refreshAudit = () => {
    setIssues(getAuditIssues());
    logFixProgressConsole();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(issues, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `quantum-audit-report-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Compute stats
  const totalCount = issues.length;
  const workingCount = issues.filter(i => i.status === 'fixed').length;
  const inProgressCount = issues.filter(i => i.status === 'in-progress').length;
  const nonWorkingCount = issues.filter(i => i.status === 'pending').length;
  const successRate = totalCount > 0 ? Math.round((workingCount / totalCount) * 100) : 100;

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesSearch = 
      issue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      issue.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Recharts Data
  const pieData = [
    { name: lang === 'ar' ? 'جاهز كلياً' : 'Working / Fixed', value: workingCount, color: '#10b981' },
    { name: lang === 'ar' ? 'قيد التطوير' : 'In Progress', value: inProgressCount, color: '#f59e0b' },
    { name: lang === 'ar' ? 'قيد الانتظار' : 'Pending', value: nonWorkingCount, color: '#ef4444' }
  ];

  const priorityData = [
    { 
      name: lang === 'ar' ? 'حرجة' : 'Critical', 
      Count: issues.filter(i => i.priority === 'critical').length,
      Fixed: issues.filter(i => i.priority === 'critical' && i.status === 'fixed').length
    },
    { 
      name: lang === 'ar' ? 'عالية' : 'High', 
      Count: issues.filter(i => i.priority === 'high').length,
      Fixed: issues.filter(i => i.priority === 'high' && i.status === 'fixed').length
    },
    { 
      name: lang === 'ar' ? 'متوسطة' : 'Medium', 
      Count: issues.filter(i => i.priority === 'medium').length,
      Fixed: issues.filter(i => i.priority === 'medium' && i.status === 'fixed').length
    },
    { 
      name: lang === 'ar' ? 'منخفضة' : 'Low', 
      Count: issues.filter(i => i.priority === 'low').length,
      Fixed: issues.filter(i => i.priority === 'low' && i.status === 'fixed').length 
    }
  ];

  return (
    <div 
      className="p-4 md:p-8 w-full h-full bg-[#1A1A2E]/95 backdrop-blur-md text-white overflow-y-auto"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top action control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#00C4CC] uppercase tracking-widest block mb-1">
            {lang === 'ar' ? 'تطبيقات كوانتوم ستوديو' : 'Quantum Studio Suite'}
          </span>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="text-[#8b5cf6] animate-pulse" />
            {lang === 'ar' ? 'لوحة تدقيق واختبار الميزات' : 'System Features Audit Dashboard'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Toggle */}
          <button 
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-gray-700/50 cursor-pointer"
          >
            <Globe size={14} />
            {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
          </button>

          {/* Export Report */}
          <button 
            onClick={handleExportJSON}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-[#8b5cf6]/30 cursor-pointer"
          >
            <Download size={14} className="text-[#00C4CC]" />
            {lang === 'ar' ? 'تصدير التقرير كـ JSON' : 'Export JSON'}
          </button>

          {/* Refresh button */}
          <button 
            onClick={refreshAudit}
            className="bg-slate-800 hover:bg-[#8b5cf6]/30 text-white p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center border border-gray-700 cursor-pointer"
            title="إعادة فحص سريع"
          >
            <RefreshCw size={15} />
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-500/30 cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* Visual Stats Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total stats card */}
        <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Boxes size={22} className="text-white" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{lang === 'ar' ? 'إجمالي الميزات المدققة' : 'Total Audited Features'}</span>
            <span className="text-2xl font-bold font-mono">{totalCount}</span>
          </div>
        </div>

        {/* Working status card */}
        <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{lang === 'ar' ? 'ميزات تعمل بنجاح' : 'Working Features'}</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{workingCount}</span>
          </div>
        </div>

        {/* Partially working card */}
        <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{lang === 'ar' ? 'قيد التطوير / جزئي' : 'In Progress / Partial'}</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{inProgressCount}</span>
          </div>
        </div>

        {/* Complete Success Rate Indicator */}
        <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 text-[#06b6d4] flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{lang === 'ar' ? 'معدل النجاح الإجمالي' : 'Resolution Success Rate'}</span>
            <span className="text-2xl font-bold font-mono text-[#06b6d4]">{successRate}%</span>
          </div>
        </div>

      </div>

      {/* Progress Bar container */}
      <div className="w-full bg-gray-900/50 rounded-2xl p-4 mb-8 border border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-300">{lang === 'ar' ? 'عملية إصلاح وتحويل الستبات البرمجية قيد العمل' : 'Operational Status Tracker'}</span>
          <span className="text-xs font-bold font-mono text-[#00C4CC]">{successRate}% ({workingCount} / {totalCount})</span>
        </div>
        <div className="w-full h-3.5 bg-gray-800 overflow-hidden rounded-full flex">
          <div className="bg-gradient-to-r from-[#10b981] to-[#059669] h-full" style={{ width: `${(workingCount/totalCount)*100}%` }} title="Fixed" />
          <div className="bg-amber-500 h-full animate-pulse" style={{ width: `${(inProgressCount/totalCount)*100}%` }} title="In Progress" />
          <div className="bg-red-500 h-full" style={{ width: `${(nonWorkingCount/totalCount)*100}%` }} title="Pending" />
        </div>
      </div>

      {/* Visual Report Charts Panel Toggle */}
      <div className="flex justify-center md:justify-start gap-4 mb-6 border-b border-gray-800 pb-1">
        <button 
          onClick={() => setActiveTab('table')}
          className={`pb-3 px-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'table' ? 'text-[#00C4CC]' : 'text-gray-400 hover:text-white'}`}
        >
          {lang === 'ar' ? '📋 جدول تفاصيل ميزات التطوير' : '📋 Features Audit Status'}
          {activeTab === 'table' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C4CC]" />}
        </button>
        <button 
          onClick={() => setActiveTab('visual_report')}
          className={`pb-3 px-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'visual_report' ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-white'}`}
        >
          {lang === 'ar' ? '📊 لوحة توزيع التقارير البصرية' : '📊 Visual Charts'}
          {activeTab === 'visual_report' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b5cf6]" />}
        </button>
      </div>

      {activeTab === 'visual_report' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 h-[250px] md:h-[300px]">
          
          {/* Recharts Pie status Chart */}
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-300 mb-2">{lang === 'ar' ? 'حالة جاهزية الميزات' : 'Feature Completion Visual'}:</span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #333', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-1 text-[11px] font-bold">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recharts Priority Bar Chart */}
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-300 mb-2">{lang === 'ar' ? 'الميزات المدققة حسب مستويات الأهمية' : 'Pending Features By Priority'}:</span>
            <div className="flex-1 w-full text-xs text-gray-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical">
                  <XAxis type="number" stroke="#ccc" />
                  <YAxis dataKey="name" type="category" stroke="#ccc" />
                  <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #333' }} />
                  <Bar dataKey="Count" name={lang === 'ar' ? 'العدد الإجمالي' : 'Total Count'} fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Fixed" name={lang === 'ar' ? 'تم الإصلاح' : 'Fully Fixed'} fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Filters controls bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Status Filter */}
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">
                {lang === 'ar' ? 'فحص الحالة:' : 'Filter Status:'}
              </label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800/80 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="all">{lang === 'ar' ? 'عرض الكل' : 'All Statuses'}</option>
                <option value="fixed">{lang === 'ar' ? '✅ جاهز للتشغيل والإنتاج (Fixed)' : 'Fixed / Fully operational'}</option>
                <option value="in-progress">{lang === 'ar' ? '⚠️ قيد العمل والتنفيذ (In Progress)' : 'In Progress'}</option>
                <option value="pending">{lang === 'ar' ? '❌ ستب عير مفعل (Pending)' : 'Pending Stub'}</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">
                {lang === 'ar' ? 'الفلترة حسب الأهمية:' : 'Filter Priority:'}
              </label>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800/80 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="all">{lang === 'ar' ? 'عرض الكل' : 'All Priorities'}</option>
                <option value="critical">{lang === 'ar' ? '🚨 حرجة للغاية (Critical)' : 'Critical'}</option>
                <option value="high">{lang === 'ar' ? '⚡ عالية (High)' : 'High'}</option>
                <option value="medium">{lang === 'ar' ? '💎 متوسطة (Medium)' : 'Medium'}</option>
                <option value="low">{lang === 'ar' ? '📄 منخفضة (Low)' : 'Low'}</option>
              </select>
            </div>

            {/* Live Search */}
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">
                {lang === 'ar' ? 'البحث بالاسم أو المسار:' : 'Search Features:'}
              </label>
              <input 
                type="text"
                placeholder={lang === 'ar' ? 'ابحث هنا...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800/80 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>

          </div>

          {/* Table list */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800/80 overflow-x-auto shadow-2xl">
            <table className="w-full text-left text-xs font-sans min-w-[700px]">
              <thead className="bg-[#1A1A2E] text-gray-300 border-b border-gray-800 font-bold">
                <tr>
                  <th className="p-4 text-center w-14">#</th>
                  <th className="p-4 text-center w-24">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الاسم والمشكلة' : 'Feature Name & Trace'}</th>
                  <th className="p-4 w-32">{lang === 'ar' ? 'الأهمية' : 'Priority'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الإصلاح المطبق' : 'Proposed Fix'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {filteredIssues.map((issue, idx) => {
                  let statusBadge = (
                    <span className="bg-red-500/15 text-red-400 px-3 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 border border-red-500/30">
                      <XCircle size={11} /> {lang === 'ar' ? 'ستب معطل' : 'Pending'}
                    </span>
                  );
                  if (issue.status === 'fixed') {
                    statusBadge = (
                      <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 size={11} /> {lang === 'ar' ? 'جاهز كليا' : 'Fixed'}
                      </span>
                    );
                  } else if (issue.status === 'in-progress') {
                    statusBadge = (
                      <span className="bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 border border-amber-500/30">
                        <AlertTriangle size={11} /> {lang === 'ar' ? 'قيد العمل' : 'Working'}
                      </span>
                    );
                  }

                  let priorityBadge = (
                    <span className="inline-block bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold text-[10px]">
                      {issue.priority.toUpperCase()}
                    </span>
                  );
                  if (issue.priority === 'critical') {
                    priorityBadge = (
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-extrabold text-[10px] inline-flex items-center gap-1 border border-rose-500/20">
                        <BadgeAlert size={10} className="animate-pulse" /> {lang === 'ar' ? 'حرجة للغاية' : 'CRITICAL'}
                      </span>
                    );
                  } else if (issue.priority === 'high') {
                    priorityBadge = (
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold text-[10px] inline-flex items-center gap-1 border border-amber-500/10">
                        {lang === 'ar' ? 'عالية' : 'HIGH'}
                      </span>
                    );
                  }

                  return (
                    <tr key={issue.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 text-center font-mono text-gray-500">{idx + 1}</td>
                      <td className="p-4 text-center">{statusBadge}</td>
                      <td className="p-4">
                        <span className="font-bold text-gray-100 text-sm">{issue.name}</span>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5 break-all">{issue.filePath}</div>
                        <div className="text-gray-400 mt-1 leading-normal italic">
                          "{issue.currentState}"
                        </div>
                      </td>
                      <td className="p-4">{priorityBadge}</td>
                      <td className="p-4 text-gray-300 leading-normal">
                        {issue.requiredFix}
                      </td>
                    </tr>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 text-xs font-bold">
                      {lang === 'ar' ? 'لم يتم العثور على أي نتائج مطابقة لفلترة الفحص' : 'No issues matches current filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};
