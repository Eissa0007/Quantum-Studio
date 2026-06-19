import React, { useState } from "react";
import { Key, Globe, Shield, ExternalLink, HelpCircle, Code, Server, Layout, ChevronLeft, Layers, BookOpen } from "lucide-react";
import { useStore } from "../store/useStore";

export const EnvSetupGuide = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'platforms'>('keys');
  const { setActivePanel } = useStore();

  const services = [
    {
      name: "Pexels API",
      envName: "VITE_PEXELS_API_KEY",
      descAr: "مطلوب لتشغيل مستعرض الصور الديناميكية المدمج في لوحة العناصر.",
      link: "https://www.pexels.com/api/",
      steps: [
        "سجل دخولك أو أنشئ حساباً جديداً على Pexels.",
        "توجه إلى صفحة الـ API من القائمة العلوية أو من خلال الرابط المرفق.",
        "انقر على 'Your API Key' ثم اطلب مفتاحاً جديداً.",
        "املأ تفاصيل مبررات الاستخدام البسيطة (على سبيل المثال: Quantum Studio design app).",
        "انسخ المفتاح الذي يظهر لك وضعه في ملف البيئة."
      ]
    },
    {
      name: "Supabase Cloud DB",
      envName: "VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY",
      descAr: "قاعدة بيانات سحابية لحفظ المشاريع واستعادتها ومزامنتها لحظياً.",
      link: "https://supabase.com/",
      steps: [
        "سجل دخولك إلى Supabase وأنشئ مشروعاً (Project) جديداً.",
        "بعد انتهاء تهيئة المشروع، اذهب إلى Settings ثم API.",
        "انسخ قيمة الـ URL وضعه في متغير 'VITE_SUPABASE_URL'.",
        "انسخ قيمة الـ Project API keys (النوع anon / public) وضعه في 'VITE_SUPABASE_ANON_KEY'."
      ]
    },
    {
      name: "Firebase (Auth)",
      envName: "VITE_FIREBASE_API_KEY / V_DOMAIN / V_PROJECT_ID",
      descAr: "مطلوب للتحكم في خدمات تسجيل الدخول للمستخدمين والمصادقة الآمنة.",
      link: "https://console.firebase.google.com/",
      steps: [
        "افتح منصة Firebase وأنشئ مشروعًا جديداً.",
        "أضف تطبيق ويب (Web App) للمشروع للحصول على بيانات التهيئة.",
        "ابحث عن حزمة تهيئة الـ Firebase Config.",
        "انسخ API Key إلى VITE_FIREBASE_API_KEY.",
        "انسخ Auth Domain إلى VITE_FIREBASE_AUTH_DOMAIN.",
        "انسخ Project ID إلى VITE_FIREBASE_PROJECT_ID."
      ]
    },
    {
      name: "Unsplash & Pixabay (اختياري)",
      envName: "VITE_UNSPLASH_ACCESS_KEY / VITE_PIXABAY_API_KEY",
      descAr: "مصادر إضافية لإثراء لوحة العناصر بالصور والمكعبات الهندسية والأيقونات الفيكتور الفاخرة.",
      link: "https://unsplash.com/developers",
      steps: [
        "لـ Unsplash: توجه إلى Unsplash Developers وأنشئ تجربة تطبيق جديدة (New Application)، ثم انسخ Access Key الخاص بك.",
        "لـ Pixabay: افتح Pixabay API Docs وسجل الدخول، ستجد مفتاح API الخاص بك باللون الأخضر في المستندات مباشرة."
      ]
    }
  ];

  const platforms = [
    {
      name: "Google AI Studio / التطوير المحلي (.env)",
      descAr: "كيفية ضبط المتغيرات محلياً في مجلد بيئة العمل لديك.",
      steps: [
        "أنشئ ملفاً باسم '.env' في المجلد الرئيسي الحقيقي للتطبيق (بجانب package.json).",
        "انسخ المحتوى الموجود في ملف '.env.example' والصقه في ملفك الجديد.",
        "استبدل القيم الافتراضية بالمفاتيح الحقيقية التي حصلت عليها.",
        "أعد تشغيل خادم التطوير (npm run dev) لتطبيق المتغيرات بشكل صحيح."
      ]
    },
    {
      name: "Hugging Face (Repository Secrets)",
      descAr: "لتشغيل تطبيقك على فضاءات هجينغ فيس بنجاح.",
      steps: [
        "اذهب إلى إعدادات الفضاء الخاص بك (Space Settings).",
        "انزل لأسفل حتى تصل إلى قسم 'Repository Secrets'.",
        "أضف سراً جديداً لكل متغير باسم المتغير وقيمته.",
        "سيقوم النظام تلقائياً بإعادة تهيئة وبناء التطبيق مستخدماً هذه المفاتيح بطريقة آمنة."
      ]
    },
    {
      name: "Vercel / Netlify",
      descAr: "للنشر السحابي السريع على منصات الاستضافة الحديثة.",
      steps: [
        "ادخل إلى لوحة التحكم الخاصة بمشروعك في Vercel.",
        "اذهب إلى التبويب 'Settings' ثم اختر 'Environment Variables' من القائمة الجانبية.",
        "أضف مفاتيحك دفعة واحدة باسم المتغير وقيمته المقابلة لها.",
        "أعد النشر (Redeploy) ليتم تزويد الأكواد في الواجهة الأمامية بالمفاتيح فوراً."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0F1419] text-[#0F1419] dark:text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Widget */}
        <div className="bg-gradient-to-r from-[#00C4CC]/5 to-[#7D3CFF]/5 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActivePanel('none')} 
              className="p-3 bg-white dark:bg-[#1A1A2E] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft size={20} className="transform rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#00C4CC] tracking-wider uppercase mb-1">
                <BookOpen size={14} />
                <span>دليل تشغيل الأنظمة</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">إعداد متغيرات البيئة</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                دليل تفصيلي خطوة بخطوة للحصول على كافة مفاتيح الـ API للتطوير والإنتاج السحابي.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all px-6 border-b-2 ${
              activeTab === 'keys'
                ? 'border-[#00C4CC] text-[#00C4CC]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Key size={16} />
            خطوات جلب مفاتيح الـ API
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all px-6 border-b-2 ${
              activeTab === 'platforms'
                ? 'border-[#00C4CC] text-[#00C4CC]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Layers size={16} />
            الإعداد على منصات الاستضافة
          </button>
        </div>

        {/* Tab Contents: API Keys Guide */}
        {activeTab === 'keys' ? (
          <div className="space-y-6">
            {services.map((service, index) => (
              <div 
                key={service.name} 
                className="bg-white dark:bg-[#1A1A2E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-gray-800/60 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <span className="bg-[#00C4CC]/10 text-[#00C4CC] w-7 h-7 flex items-center justify-center rounded-lg text-sm font-black">
                        {index + 1}
                      </span>
                      {service.name}
                    </h3>
                    <code className="text-[11px] text-pink-600 dark:text-pink-400 font-mono font-medium block mt-1.5">
                      {service.envName}
                    </code>
                  </div>

                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#00C4CC] font-bold hover:underline bg-[#00C4CC]/10 px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    رابط الموقع الرسمي
                    <ExternalLink size={12} />
                  </a>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {service.descAr}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-400">خطوات التنفيذ بالتفصيل:</h4>
                  <ol className="list-decimal list-inside space-y-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed pr-2">
                    {service.steps.map((step, idx) => (
                      <li key={idx} className="marker:text-[#00C4CC] marker:font-bold">
                        <span className="mr-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab Contents: Deployment Platforms Setup */
          <div className="space-y-6">
            {platforms.map((platform, index) => (
              <div 
                key={platform.name} 
                className="bg-white dark:bg-[#1A1A2E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="border-b border-gray-100 dark:border-gray-800/60 pb-3">
                  <h3 className="text-base font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                    <Server size={18} className="text-[#00C4CC]" />
                    {platform.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{platform.descAr}</p>
                </div>

                <div className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed pr-2">
                    {platform.steps.map((step, idx) => (
                      <li key={idx} className="marker:text-[#00C4CC] marker:font-bold">
                        <span className="mr-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Helpful tips banner */}
        <div className="bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 p-5 rounded-2xl flex gap-3.5 text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
          <HelpCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold mb-1">هل تواجه مشكلة بعد إضافة المتغيرات؟</h4>
            <p>
              تأكد دائماً من عدم وجود مسافات فارغة زائدة قبل أو بعد المفتاح عند نسخه. في البيئة المحلية، بعد قيامك بتعديل ملف <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono font-bold">.env</code>، يجب عليك إغلاق منفذ الأوامر وإعادة تشغيل الخادم مجدداً لتحديث المتغيرات المخزنة في الذاكرة المؤقتة لعملية البناء.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
