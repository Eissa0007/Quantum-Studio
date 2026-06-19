import React, { useState } from "react";
import { checkAllEnvVars, checkEnvVar, EnvValidationResult } from "../utils/envChecker";
import { maskValue, checkEnvDiagnostics } from "../utils/diagnostics";
import { setEnvVar, resetToDefaults, exportEnvVars, importEnvVars, validateEnvVar } from "../utils/envManager";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Clipboard, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  ChevronLeft, 
  RefreshCw, 
  Terminal, 
  Edit3, 
  Save, 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertCircle 
} from "lucide-react";
import { useStore } from "../store/useStore";
import { navigateTo } from "../utils/navigation";
import { APIKeyGuide } from "./APIKeyGuide";

export const EnvVariablesChecker = () => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [results, setResults] = useState<EnvValidationResult[]>(() => checkAllEnvVars());
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [copiedVarName, setCopiedVarName] = useState<string | null>(null);
  const [copiedVarValue, setCopiedVarValue] = useState<string | null>(null);
  const { setActivePanel } = useStore();

  const handleRefresh = () => {
    setResults(checkAllEnvVars());
    checkEnvDiagnostics();
    showFeedback(lang === 'ar' ? 'تم تحديث فحص المتغيرات' : 'Refreshed variable checks');
  };

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const startEditing = (name: string, currentVal: string | undefined) => {
    setEditingVar(name);
    setEditValue(currentVal || "");
    setValidationError(null);
  };

  const cancelEditing = () => {
    setEditingVar(null);
    setEditValue("");
    setValidationError(null);
  };

  const handleSave = (name: string) => {
    const validation = validateEnvVar(name, editValue);
    if (!validation.isValid) {
      setValidationError(validation.messageAr);
      return;
    }

    // Save to LocalStorage
    setEnvVar(name, editValue);
    setEditingVar(null);
    setEditValue("");
    setValidationError(null);
    const updatedResults = checkAllEnvVars();
    setResults(updatedResults);
    
    // Auto-reload alert or automatic check-in
    showFeedback(lang === 'ar' ? 'تم حفظ المتغير بنجاح! سيتم تطبيق التغييرات فوراً.' : 'Saved successfully! Changes are applied instantly.');
    
    // Optional refresh check diagnostic log to devtool console
    checkEnvDiagnostics();
  };

  const handleExport = () => {
    const content = exportEnvVars();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quantum-studio-keys.env";
    link.click();
    URL.revokeObjectURL(url);
    showFeedback(lang === 'ar' ? 'تم تحميل ملف التكوين بنجاح' : 'Downloaded configuration file successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const success = importEnvVars(text);
      if (success) {
        setResults(checkAllEnvVars());
        checkEnvDiagnostics();
        showFeedback(lang === 'ar' ? 'تم استيراد الملف وتثبيت القيم بنجاح' : 'Imported and updated config values successfully');
      } else {
        setValidationError(lang === 'ar' ? 'لم يتم العثور على متغيرات متوافقة في الملف' : 'No compatible env variables found in file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع المفاتيح المخصصة والعودة للتكوين الافتراضي للملف؟' : 'Are you sure you want to restore default configurations? This resets storage values.')) {
      resetToDefaults();
      setResults(checkAllEnvVars());
      checkEnvDiagnostics();
      showFeedback(lang === 'ar' ? 'تمت إعادة تعيين القيم الافتراضية بنجاح' : 'Reset to default configurations successfully');
    }
  };

  const copyToClipboard = (text: string, type: 'name' | 'value', varName: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'name') {
      setCopiedVarName(varName);
      setTimeout(() => setCopiedVarName(null), 1500);
    } else {
      setCopiedVarValue(varName);
      setTimeout(() => setCopiedVarValue(null), 1500);
    }
  };

  const getStatusBadge = (variable: EnvValidationResult) => {
    if (!variable.isSet) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <ShieldAlert size={12} />
          {lang === 'ar' ? 'مفقود ❌' : 'Missing ❌'}
        </span>
      );
    }
    if (!variable.isValid) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <ShieldAlert size={12} />
          {lang === 'ar' ? 'تنسيق خاطئ ⚠️' : 'Format Warning ⚠️'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <ShieldCheck size={12} />
        {lang === 'ar' ? 'جاهز ✅' : 'Active ✅'}
      </span>
    );
  };

  const totalCount = results.length;
  const readyCount = results.filter(r => r.isSet && r.isValid).length;
  const missingCount = results.filter(r => !r.isSet).length;
  const warningCount = results.filter(r => r.isSet && !r.isValid).length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0F1419] text-[#0F1419] dark:text-white p-6 md:p-12 overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Success / Error Status Banner */}
        {successMsg && (
          <div className="bg-emerald-500 text-white p-4 rounded-xl text-xs font-bold text-center tracking-wide animate-bounce flex items-center justify-center gap-2">
            <Check size={16} />
            {successMsg}
          </div>
        )}

        {validationError && (
          <div className="bg-rose-500 text-white p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {validationError}
          </div>
        )}

        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1A1A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo('/')} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
              title={lang === 'ar' ? 'العودة للمنصة' : 'Back to Studio'}
            >
              <ChevronLeft size={20} className={lang === 'ar' ? 'transform rotate-180' : ''} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {lang === 'ar' ? 'مركز إدارة متغيرات البيئة' : 'Environment Variables Diagnoser'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {lang === 'ar' ? 'محرر وموثق لوحة المفاتيح لإمكانية التشغيل الفوري والربط السحابي الحقيقي للخدمات' : 'Validate and customize cloud configuration and third-party keys'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-bold"
            >
              <Globe size={16} />
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all text-sm font-bold text-gray-700 dark:text-gray-200"
            >
              <RefreshCw size={16} />
              {lang === 'ar' ? 'تحديث الفحص' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Dashboard Status Summary Widget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1A2E] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400">
              {lang === 'ar' ? 'مستوى التهيئة السحابية' : 'Configuration health'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#00C4CC]">
                {totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0}%
              </span>
              <span className="text-xs text-gray-400">({readyCount}/{totalCount})</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A2E] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400">
              {lang === 'ar' ? 'المتغيرات الجاهزة' : 'Configured successfully'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">{readyCount}</span>
              <span className="text-xs text-gray-400">{lang === 'ar' ? 'متغيرات' : 'variables'}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A2E] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400">
              {lang === 'ar' ? 'مفاتيح مفقودة' : 'Missing configuration'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">{missingCount}</span>
              <span className="text-xs text-gray-400">{lang === 'ar' ? 'تحذير' : 'warnings'}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A2E] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400">
              {lang === 'ar' ? 'تنبيهات التنسيق' : 'Format warnings'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{warningCount}</span>
              <span className="text-xs text-gray-400">{lang === 'ar' ? 'تحقق' : 'checks'}</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar for Importing / Exporting .env */}
        <div className="bg-white dark:bg-[#1A1A2E] p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">{lang === 'ar' ? 'التحكم السريع في ملف الإعداد' : 'Fast Config Operations'}</h3>
            <p className="text-xs text-gray-400">{lang === 'ar' ? 'تصدير أو استيراد مفاتيح الحفظ كملف .env كامل' : 'Backup or restore your customized settings to a local file'}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Download size={14} />
              {lang === 'ar' ? 'تصدير كملف .env' : 'Export .env'}
            </button>
            <label className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
              <Upload size={14} />
              <span>{lang === 'ar' ? 'استيراد من .env' : 'Import .env'}</span>
              <input 
                type="file" 
                accept=".env,text/plain" 
                onChange={handleImport} 
                className="hidden" 
              />
            </label>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
            >
              <RotateCcw size={14} />
              {lang === 'ar' ? 'استعادة الافتراضي' : 'Reset All'}
            </button>
          </div>
        </div>

        {/* Interactive Console Diagnostic Prompt */}
        <div className="bg-[#0F1419] text-gray-300 p-5 rounded-2xl shadow-md border border-gray-800 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-[#00C4CC] font-bold">
              <Terminal size={14} />
              <span>{lang === 'ar' ? 'تشخيصات المطورين مدمجة الكونسول' : 'Developer Console Diagnostics'}</span>
            </div>
            <span className="bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-400">Interactive</span>
          </div>
          <p className="text-gray-400">
            {lang === 'ar' 
              ? 'يمكنك فحص المتغيرات مباشرة بمجرد كتابة الأمر التالي في الكونسول:'
              : 'You can query these at any time in developer tools by writing:'}
          </p>
          <div className="bg-black/40 p-2.5 rounded-lg flex justify-between items-center border border-gray-800/80">
            <code className="text-green-400 select-all font-semibold">window.checkEnv()</code>
            <button 
              onClick={() => copyToClipboard('window.checkEnv()', 'name', 'consoleCmd')}
              className="text-gray-400 hover:text-[#00C4CC] p-1 rounded hover:bg-gray-800 transition-colors"
              title="Copy Command"
            >
              {copiedVarName === 'consoleCmd' ? <Check size={14} className="text-green-400" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* List of variables */}
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold">
              {lang === 'ar' ? 'تفاصيل محرر متغيرات البيئة' : 'Live Environment Variables Editor'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {lang === 'ar' ? 'اضبط مفاتيحك وحفظها على المتصفح بشكل آمن للتطبيق على الفور' : 'Interactively edit and validate variables loaded directly in visual sandbox'}
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((variable) => {
              const isEditing = editingVar === variable.name;
              return (
                <div key={variable.name} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Key Identity & Status */}
                    <div className="space-y-1 w-full md:w-auto">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-2.5 py-1 rounded-xl text-xs font-semibold select-all font-mono">
                          {variable.name}
                        </code>
                        {getStatusBadge(variable)}
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {lang === 'ar' 
                          ? `${variable.name === 'VITE_PEXELS_API_KEY' ? 'مفتاح API الخاص بـ Pexels (الصور والفيديو)' : variable.name.replace('VITE_', '').replace(/_/g, ' ')}`
                          : `${variable.name.replace('VITE_', '').replaceAll('_', ' ')} Key`}
                      </p>
                    </div>

                    {/* Masked display + Action buttons */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
                      {!isEditing && (
                        <div className="text-right text-xs text-gray-400 font-mono font-medium">
                          {lang === 'ar' ? 'القيمة الحالية: ' : 'Value: '}
                          <span className={`px-2 py-0.5 rounded font-bold ${variable.isSet ? 'bg-green-100/10 text-green-500' : 'bg-red-100/10 text-red-500'}`}>
                            {maskValue(variable.value)}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {!isEditing ? (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => startEditing(variable.name, variable.value)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#7D3CFF]/10 text-[#7D3CFF] hover:bg-[#7D3CFF]/25 rounded-xl text-xs font-bold transition-all"
                            >
                              <Edit3 size={12} />
                              {lang === 'ar' ? 'تعديل المفتاح' : 'Edit'}
                            </button>

                            {/* Copy Name */}
                            <button
                              onClick={() => copyToClipboard(variable.name, 'name', variable.name)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                              title="Copy name"
                            >
                              {copiedVarName === variable.name ? <Check size={12} className="text-green-500" /> : <Clipboard size={12} />}
                              {lang === 'ar' ? 'نسخ' : 'Copy'}
                            </button>

                            {/* Open dashboard link */}
                            <a
                              href={variable.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C4CC]/10 hover:bg-[#00C4CC]/20 text-[#00C4CC] rounded-xl text-xs font-bold transition-all text-center"
                            >
                              <ExternalLink size={12} />
                              {lang === 'ar' ? 'الحصول عليه' : 'How to Get'}
                            </a>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Editing UI Input block */}
                  {isEditing && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={lang === 'ar' ? 'أدخل قيمة المتغير الجديدة هنا...' : 'Enter new value...'}
                          className="flex-1 bg-white dark:bg-gray-800 text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00C4CC]"
                          dir="ltr"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSave(variable.name)}
                            className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition-all"
                          >
                            <Save size={14} />
                            {lang === 'ar' ? 'حفظ المفتاح' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-250 rounded-xl text-xs font-bold transition-all"
                          >
                            <X size={14} />
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestion / Tips guidance block */}
                  {(!variable.isValid || !variable.isSet) && !isEditing && (
                    <div className="mt-3.5 bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 p-3.5 rounded-xl text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      <strong>{lang === 'ar' ? '💡 توجيه: ' : '💡 Guidance: '}</strong>
                      {variable.suggestions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Key Selection Guide */}
        <APIKeyGuide />

      </div>
    </div>
  );
};
