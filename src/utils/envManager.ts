import { ENV_VARS_METADATA } from "./envChecker";

export const getEnvVar = (name: string): string | undefined => {
  if (typeof window !== "undefined") {
    const localVal = localStorage.getItem(`kv_env_${name}`);
    if (localVal !== null) return localVal;
  }
  return (import.meta as any).env[name];
};

export const setEnvVar = (name: string, value: string): boolean => {
  if (typeof window !== "undefined") {
    const trimmed = value.trim();
    localStorage.setItem(`kv_env_${name}`, trimmed);
    return true;
  }
  return false;
};

export const validateEnvVar = (name: string, value: string): { isValid: boolean; messageAr: string } => {
  const valTrimmed = value.trim();
  if (valTrimmed === "") {
    return { isValid: false, messageAr: "القيمة لا يمكن أن تكون فارغة" };
  }

  switch (name) {
    case "VITE_SUPABASE_URL": {
      const isValid = valTrimmed.startsWith("https://") && (valTrimmed.includes(".supabase.co") || valTrimmed.includes(".supabase.net") || valTrimmed.includes("localhost"));
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "يجب أن يبدأ بـ https:// وينتهي بـ .supabase.co"
      };
    }
    case "VITE_SUPABASE_ANON_KEY": {
      const isValid = valTrimmed.startsWith("eyJ") && valTrimmed.length > 50;
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "يجب أن يبدأ بـ eyJ وتكون قيمته أطول من 50 حرفاً"
      };
    }
    case "VITE_PEXELS_API_KEY": {
      const isValid = valTrimmed.length >= 40 && !valTrimmed.includes("@");
      return {
        isValid,
        messageAr: valTrimmed.includes("@") 
          ? "تنبيه: لقد قمت بإدخال بريد إلكتروني بدلاً من مفتاح API الحقيقي!" 
          : (isValid ? "تنسيق صحيح" : "يجب أن يكون المفتاح بطول 40 حرفاً أو أكثر")
      };
    }
    case "VITE_UNSPLASH_ACCESS_KEY": {
      const isValid = valTrimmed.length >= 20;
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "مفتاح Unsplash يبدو قصيراً جداً (يتوقع 20+ حرفاً)"
      };
    }
    case "VITE_PIXABAY_API_KEY": {
      // Pixabay usually numerical-hex validation or generic length check
      const isFormat = /^\d+-[a-fA-F0-9]+$/.test(valTrimmed) || valTrimmed.length > 10;
      const hasAt = valTrimmed.includes("@");
      return {
        isValid: isFormat && !hasAt,
        messageAr: hasAt
          ? "تنبيه: لقد قمت بإدخال بريد إلكتروني بدلاً من مفتاح API الحقيقي لموقع Pixabay!"
          : (isFormat ? "تنسيق صحيح" : "يتوقع كود Pixabay بالتنسيق: أرقام-حروف (مثال: 123456-abcde)")
      };
    }
    case "VITE_FIREBASE_API_KEY": {
      const isValid = valTrimmed.length >= 35;
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "مفتاح Firebase يتوقع أن يكون 35 حرفاً على الأقل"
      };
    }
    case "VITE_FIREBASE_AUTH_DOMAIN": {
      const isValid = valTrimmed.endsWith(".firebaseapp.com") || valTrimmed.endsWith(".web.app");
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "نطاق المصادقة يتوقع أن ينتهي بـ .firebaseapp.com أو .web.app"
      };
    }
    case "VITE_FIREBASE_PROJECT_ID": {
      const isValid = /^[a-z0-9-]+$/.test(valTrimmed);
      return {
        isValid,
        messageAr: isValid ? "تنسيق صحيح" : "يتوجب كتابة معرف المشروع بأحرف صغيرة وأرقام وفواصل فقط"
      };
    }
    default:
      return { isValid: true, messageAr: "صحيح" };
  }
};

export const exportEnvVars = (): string => {
  let envContent = `# ============================================\n`;
  envContent += `# QUANTUM STUDIO - Live Environment Variables\n`;
  envContent += `# Exported on: ${new Date().toISOString()}\n`;
  envContent += `# ============================================\n\n`;

  Object.keys(ENV_VARS_METADATA).forEach((name) => {
    const value = getEnvVar(name) || "";
    envContent += `${name}=${value}\n`;
  });

  return envContent;
};

export const importEnvVars = (envText: string): boolean => {
  if (!envText) return false;
  try {
    const lines = envText.split(/\r?\n/);
    let anyImported = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      const equalIndex = trimmed.indexOf("=");
      if (equalIndex > 0) {
        const name = trimmed.slice(0, equalIndex).trim();
        const value = trimmed.slice(equalIndex + 1).trim();

        if (ENV_VARS_METADATA[name]) {
          // It's a known env variable
          setEnvVar(name, value);
          anyImported = true;
        }
      }
    });

    return anyImported;
  } catch (err) {
    console.error("Error importing env variables:", err);
    return false;
  }
};

export const resetToDefaults = (): void => {
  Object.keys(ENV_VARS_METADATA).forEach((name) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`kv_env_${name}`);
    }
  });
};
