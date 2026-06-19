import React from "react";
import { Image, Video, Palette, AlertTriangle, CheckCircle, Info, ExternalLink, HelpCircle } from "lucide-react";

export const APIKeyGuide = () => {
  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 text-right font-sans" dir="rtl">
      
      {/* Visual Header */}
      <div className="border-b border-gray-100 dark:border-gray-800/80 pb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="text-[#00C4CC]" size={24} />
          دليل اختيار وتثبيت مفاتيح الـ API
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          المقارنة السريعة بين كافة الخدمات السحابية ومصادر المحتوى الممتد للوحة التصميم للتطبيق
        </p>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pexels Block */}
        <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-base text-gray-800 dark:text-white">Pexels</span>
            <span className="bg-[#05a081]/15 text-[#05a081] text-[10px] font-bold px-2.5 py-1 rounded-full">الأول في دقة الفيديو</span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-450 leading-relaxed">
            محرك جبار يزود لوحة العناصر الفنية لدينا بالصور عالية الجودة ومقاطع الفيديو المتنوعة.
          </p>

          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold text-gray-400 block">يقدم للوحة التصميم:</span>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-green-600 dark:text-green-400">
                <Image size={12} /> صور عالية الدقة
              </span>
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-blue-600 dark:text-blue-400">
                <Video size={12} /> مقاطع فيديو حقيقية
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 space-y-1">
            <div><strong>الصيغة المتوقعة:</strong> <code className="text-pink-500 text-[10px] font-mono">56 حرفاً عشوائياً</code></div>
            <div><strong>مكان الجلب:</strong> <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-[#00C4CC] hover:underline inline-flex items-center gap-0.5 font-semibold">بوابة المطورين <ExternalLink size={10} /></a></div>
          </div>
        </div>

        {/* Unsplash Block */}
        <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-base text-gray-800 dark:text-white">Unsplash</span>
            <span className="bg-[#111111]/15 text-[#111111] dark:bg-white/10 dark:text-white text-[10px] font-bold px-2.5 py-1 rounded-full">الأرقى فنياً</span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-450 leading-relaxed">
            مصدر فخم للصور الفنية والطبيعة والأنماط المعمارية المناسبة للخلفيات.
          </p>

          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold text-gray-400 block">يقدم للوحة التصميم:</span>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-green-600 dark:text-green-400">
                <Image size={12} /> صور احترافية
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 space-y-1">
            <div><strong>الصيغة المتوقعة:</strong> <code className="text-pink-500 text-[10px] font-mono">40+ حرفاً (Access Key)</code></div>
            <div><strong>مكان الجلب:</strong> <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-[#00C4CC] hover:underline inline-flex items-center gap-0.5 font-semibold">بوابة المطورين <ExternalLink size={10} /></a></div>
          </div>
        </div>

        {/* Pixabay Block */}
        <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-base text-gray-800 dark:text-white">Pixabay</span>
            <span className="bg-[#2ec56f]/15 text-[#2ec56f] text-[10px] font-bold px-2.5 py-1 rounded-full">الأشمل في الوسائط</span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-455 leading-relaxed">
            محرك وسائط هائل جداً يوفر أنواعاً نادرة من الرسوم التوضيحية والفيكتور بدون خلفية للتصميم.
          </p>

          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold text-gray-400 block">يقدم للوحة التصميم:</span>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-green-600 dark:text-green-400">
                <Image size={12} /> صور توضيحية
              </span>
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-purple-600 dark:text-purple-400">
                <Palette size={12} /> رسوم فكتور ثلاثية
              </span>
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm text-blue-600 dark:text-blue-400">
                <Video size={12} /> فيديوهات غامرة
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 space-y-1">
            <div><strong>الصيغة المتوقعة:</strong> <code className="text-pink-500 text-[10px] font-mono">أرقام ومفاتيح هكس (12345678-abc...)</code></div>
            <div><strong>مكان الجلب:</strong> <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="text-[#00C4CC] hover:underline inline-flex items-center gap-0.5 font-semibold">بوابه المستندات <ExternalLink size={10} /></a></div>
          </div>
        </div>

      </div>

      {/* Common Mistakes & Fixes Section */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
          <AlertTriangle size={18} />
          الأخطاء الشائعة وطرق تفاديها عند الإعداد:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Wrong key type */}
          <div className="space-y-2 bg-white/40 dark:bg-black/25 p-4 rounded-xl border border-amber-500/10">
            <h4 className="font-extrabold text-[#7D3CFF] flex items-center gap-1">❌ الخطأ: وضع البريد الإلكتروني أو الاسم</h4>
            <p className="text-gray-600 dark:text-gray-400">
              بعض المطورين يرتكبون خطأً بكتابة بريدهم الإلكتروني الشخصي (مثل <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 font-bold rounded">@gmail.com</code>) في مساحة مفتاح الـ API لـ Pexels أو Pixabay.
            </p>
            <p className="text-green-600 dark:text-green-400 font-semibold">
              ✔ الحل المعتمد: تأكد من الحصول على الرمز المشفر المكون من حروف وأرقام عشوائية تماماً من لوحة تحكم مطوري المنصة المستهدفة.
            </p>
          </div>

          {/* Spaces / Copy issues */}
          <div className="space-y-2 bg-white/40 dark:bg-black/25 p-4 rounded-xl border border-amber-500/10">
            <h4 className="font-extrabold text-[#7D3CFF] flex items-center gap-1">❌ الخطأ: نسخ مسافات بيضاء زائدة</h4>
            <p className="text-gray-600 dark:text-gray-400">
              عند التحديد والنسخ السريع، قد تقوم بطريق الخطأ بنسخ مسافة فارغة إما في البداية أو في النهاية، مما يسبب رفض الخادم للطلب باعتباره مفتاح تالف.
            </p>
            <p className="text-green-600 dark:text-green-400 font-semibold">
              ✔ الحل المعتمد: واجهة التطبيق الحالية لدينا ستقوم تلقائياً بتنظيف المفاتيح لإزالة أي فراغات مدققة لضمان تشغيلها بنجاح تام.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
