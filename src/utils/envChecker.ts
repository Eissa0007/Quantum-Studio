import { getEnvVar } from "./envManager";

export interface EnvValidationResult {
  name: string;
  value: string | undefined;
  isSet: boolean;
  isValid: boolean;
  message: string;
  suggestions: string;
  link: string;
}

export const ENV_VARS_METADATA: Record<string, { labelAr: string; link: string; expectedFormat: string }> = {
  VITE_SUPABASE_URL: {
    labelAr: "رابط مشروع Supabase",
    link: "https://supabase.com/dashboard",
    expectedFormat: "عنوان URL صالح يبدأ بـ https:// وينتهي بـ .supabase.co"
  },
  VITE_SUPABASE_ANON_KEY: {
    labelAr: "مفتاح Supabase Canon Key (العام)",
    link: "https://supabase.com/dashboard",
    expectedFormat: "سلسلة نصية طويلة تبدأ بـ eyJ (رمز JWT)"
  },
  VITE_PEXELS_API_KEY: {
    labelAr: "مفتاح API لموقع Pexels (للصور)",
    link: "https://www.pexels.com/api/",
    expectedFormat: "سلسلة نصية من 56 حرفاً ورقماً عشوائياً"
  },
  VITE_UNSPLASH_ACCESS_KEY: {
    labelAr: "مفتاح وصول Unsplash (اختياري)",
    link: "https://unsplash.com/developers",
    expectedFormat: "مفتاح طويل من Unsplash (حوالي 43-50 حرفاً)"
  },
  VITE_PIXABAY_API_KEY: {
    labelAr: "مفتاح API لموقع Pixabay (اختياري)",
    link: "https://pixabay.com/api/docs/",
    expectedFormat: "رقم متبوع بشَرطة ومفتاح هكس مثل: 123456-abcde..."
  },
  VITE_FIREBASE_API_KEY: {
    labelAr: "مفتاح API لمشروع Firebase",
    link: "https://console.firebase.google.com/",
    expectedFormat: "مفتاح Firebase القياسي (39-40 حرفاً)"
  },
  VITE_FIREBASE_AUTH_DOMAIN: {
    labelAr: "نطاق المصادقة لمشروع Firebase",
    link: "https://console.firebase.google.com/",
    expectedFormat: "نطاق يبدأ باسم مشروعك وينتهي بـ .firebaseapp.com"
  },
  VITE_FIREBASE_PROJECT_ID: {
    labelAr: "معرف مشروع Firebase",
    link: "https://console.firebase.google.com/",
    expectedFormat: "أحرف صغيرة وأرقام وعلامات شرطة (مثال: my-project-id)"
  }
};

export const checkEnvVar = (name: string): EnvValidationResult => {
  const value = getEnvVar(name);
  const isSet = !!value && value !== "undefined" && value !== "null" && value.trim() !== "";
  const meta = ENV_VARS_METADATA[name] || { labelAr: name, link: "#", expectedFormat: "" };

  let isValid = false;
  let message = "";
  let suggestions = "";

  if (!isSet) {
    isValid = false;
    message = "المتغير غير مضبوط أو فارغ ❌";
    suggestions = `يرجى الحصول على المفتاح من الرابط التالي للحصول على ميزات التشغيل الكاملة. الصيغة المتوقعة: ${meta.expectedFormat}`;
  } else {
    // Basic formatting checks
    const valTrimmed = value.trim();
    switch (name) {
      case "VITE_SUPABASE_URL":
        isValid = valTrimmed.startsWith("https://") && (valTrimmed.includes(".supabase.co") || valTrimmed.includes(".supabase.net") || valTrimmed.includes("localhost"));
        if (!isValid) {
          message = "تنسيق الرابط غير صحيح ⚠️";
          suggestions = "يجب أن يبدأ الرابط بـ https:// وينتهي بـ .supabase.co";
        } else {
          isValid = true;
          message = "المتغير مضبوط وتنسيقه صحيح ✅";
        }
        break;

      case "VITE_SUPABASE_ANON_KEY":
        isValid = valTrimmed.startsWith("eyJ") && valTrimmed.length > 50;
        if (!isValid) {
          message = "المفتاح قد يكون تالفاً أو ليس رمز JWT صالحاً ⚠️";
          suggestions = "مفاتيح Supabase Anon تبدأ عادة بـ eyJ وتكون طويلة للغاية. تأكد من نسخ المفتاح كاملاً.";
        } else {
          message = "المتغير مضبوط وتنسيقه صحيح ✅";
        }
        break;

      case "VITE_PEXELS_API_KEY":
        // Pexels API key is exactly 56 alphanumeric characters usually
        isValid = valTrimmed.length >= 40; // Allow a safe margin but warn if too short
        if (!isValid) {
          message = "المفتاح قصير جداً أو غير مكتمل ⚠️";
          suggestions = "مفتاح Pexels يتكون عادة من 56 حرفاً من الأرقام والحروف. يرجى مراجعة المفتاح أو توليد واحد جديد.";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      case "VITE_UNSPLASH_ACCESS_KEY":
        isValid = valTrimmed.length >= 20;
        if (!isValid) {
          message = "مفتاح Unsplash Access Key يبدو قصيراً جداً ⚠️";
          suggestions = "مفاتيح Unsplash Access Key تكون طويلة (حوالي 40+ حرفاً).";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      case "VITE_PIXABAY_API_KEY":
        // Pixabay usually looks like: \d+-[a-zA-Z0-9]+
        isValid = /^\d+-[a-fA-F0-9]+$/.test(valTrimmed) || valTrimmed.length > 10;
        if (!isValid) {
          message = "تنسيق المفتاح لـ Pixabay غير مطابق للمتوقع ⚠️";
          suggestions = "التنسيق المتوقع هو أرقام متبوعة بـ - ومفاتيح هكس عشوائية (مثال: 12345678-abcde123456).";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      case "VITE_FIREBASE_API_KEY":
        isValid = valTrimmed.length >= 35;
        if (!isValid) {
          message = "تنسيق مفتاح Firebase غير مطابق للمتوقع ⚠️";
          suggestions = "يتكون مفتاح API لـ Firebase عادةً من 39-40 حرفاً.";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      case "VITE_FIREBASE_AUTH_DOMAIN":
        isValid = valTrimmed.endsWith(".firebaseapp.com") || valTrimmed.endsWith(".web.app");
        if (!isValid) {
          message = "تنسيق نطاق المصادقة Firebase قد يكون خاطئاً ⚠️";
          suggestions = "النطاق الافتراضي لـ Firebase ينتهي بـ .firebaseapp.com أو .web.app";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      case "VITE_FIREBASE_PROJECT_ID":
        isValid = /^[a-z0-9-]+$/.test(valTrimmed);
        if (!isValid) {
          message = "تنسيق معرف مشروع Firebase غير صالح ⚠️";
          suggestions = "يجب أن يحتوي معرف المشروع على أحرف صغيرة وأرقام وعلامات شرطة فقط.";
        } else {
          message = "المتغير مضبوط وتنسيقه يبدو صحيحاً ✅";
        }
        break;

      default:
        isValid = true;
        message = "المتغير مضبوط ✅";
        break;
    }
  }

  return {
    name,
    value,
    isSet,
    isValid,
    message,
    suggestions,
    link: meta.link
  };
};

export const checkAllEnvVars = (): EnvValidationResult[] => {
  return Object.keys(ENV_VARS_METADATA).map(name => checkEnvVar(name));
};
