import { checkAllEnvVars } from "./envChecker";

export const maskValue = (value: string | undefined): string => {
  if (!value) return "Missing/Empty";
  if (value.length <= 8) {
    return value.slice(0, 2) + "*".repeat(value.length - 2);
  }
  return value.slice(0, 4) + "..." + value.slice(-4);
};

export const checkEnvDiagnostics = () => {
  const results = checkAllEnvVars();
  const successfulCount = results.filter(r => r.isSet && r.isValid).length;
  
  console.log(
    `%c🔍 Checking Environment Variables... [Quantum Studio Diagnostics]`,
    "color: #00C4CC; font-weight: bold; font-size: 14px; padding: 4px;"
  );

  results.forEach(variable => {
    const maskedVal = maskValue(variable.value);
    
    if (!variable.isSet) {
      console.log(
        `%c❌ ${variable.name}: %cMissing or empty\n%c→ 🔗 Get it from: %c${variable.link}\n%c→ 💡 Suggestion: %c${variable.suggestions}`,
        "color: #FF4D4F; font-weight: bold;",
        "color: #FF4D4F;",
        "color: #8C8C8C; font-style: italic;",
        "color: #00D2FC; text-decoration: underline;",
        "color: #8C8C8C; font-style: italic;",
        "color: #FAAD14;"
      );
    } else if (!variable.isValid) {
      console.log(
        `%c⚠️ ${variable.name}: %cSet but format is invalid (%c${maskedVal}%c)\n%c→ 🔗 Get it from: %c${variable.link}\n%c→ 💡 Suggestion: %c${variable.suggestions}`,
        "color: #FAAD14; font-weight: bold;",
        "color: #FAAD14;",
        "color: #F5222D; font-weight: bold;",
        "color: #FAAD14;",
        "color: #8C8C8C; font-style: italic;",
        "color: #00D2FC; text-decoration: underline;",
        "color: #8C8C8C; font-style: italic;",
        "color: #FAAD14;"
      );
    } else {
      console.log(
        `%c✅ ${variable.name}: %c${maskedVal} %c(valid format)`,
        "color: #52C41A; font-weight: bold;",
        "color: #52C41A;",
        "color: #8C8C8C; font-style: italic;"
      );
    }
  });

  const percent = Math.round((successfulCount / results.length) * 100);
  console.log(
    `%cSummary: ${successfulCount}/${results.length} (${percent}%) variables configured correctly.`,
    "color: #F5F5F5; background-color: #1A1A2E; font-weight: bold; padding: 6px; border-radius: 4px; margin-top: 10px;"
  );

  return {
    success: successfulCount === results.length,
    configured: successfulCount,
    total: results.length,
    results: results.map(r => ({
      name: r.name,
      status: !r.isSet ? "MISSING" : !r.isValid ? "INVALID" : "OK",
      maskedValue: maskValue(r.value),
      link: r.link
    }))
  };
};

export const initializeDiagnosticsConsole = () => {
  if (typeof window !== "undefined") {
    (window as any).checkEnv = checkEnvDiagnostics;
  }
};
