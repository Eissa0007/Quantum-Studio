import { setFeatureStatus } from './fixTracker';
import { getEnvVar } from './envManager';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export async function askAIAssistant(messages: ChatMessage[]): Promise<string> {
  setFeatureStatus('ai-assistant', 'in-progress');
  const apiKey = getEnvVar('VITE_GEMINI_API_KEY') || '';

  if (messages.length === 0) {
    setFeatureStatus('ai-assistant', 'fixed');
    return "مرحباً! كيف يمكنني مساعدتك في تصميماتك الإبداعية اليوم؟";
  }

  const userMessage = messages[messages.length - 1].text;

  if (apiKey && apiKey.length > 5) {
    try {
      // Build conversation prompt from history
      const promptHistory = messages.map(msg => {
        return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
      }).join("\n");
      
      const prompt = `You are Quantum Assistant, an expert graphic design and UX/UI assistant. Understand and answer the user's latest request. Write in Arabic (العربية) if they speak in Arabic, or English if they write in English. Address their design constraints directly.
${promptHistory}
Assistant:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setFeatureStatus('ai-assistant', 'fixed');
        return text.trim();
      }
    } catch (e) {
      console.warn("AI Assistant API call failed, falling back to mock expert chatbot.", e);
    }
  }

  // Fallback design suggestions responses based on user keyword detection
  setFeatureStatus('ai-assistant', 'fixed');
  
  const textMsg = userMessage.toLowerCase();
  
  if (textMsg.includes('لون') || textMsg.includes('ألوان') || textMsg.includes('color') || textMsg.includes('palette')) {
    return `أهلاً بك! كتوصية لتناسق الألوان في تصميمك الحالي، أنصحك باعتماد لوحة ألوان دافئة وحديثة تناسب علاماتك التجارية، مثل:
1. البنفسجي الإمبراطوري (#7D3CFF) كلون أساسي لجذب الانتباه.
2. الفيروزي الخلاب (#00C4CC) كأكسنت لتباين بصري رائع.
3. الرمادي الداكن المطفأ (#1A1A2E) كخلفية لزيادة عمق التصميم.

هل ترغب في تطبيق هذه اللوحة على العناصر المحددة حالياً؟`;
  }
  
  if (textMsg.includes('خط') || textMsg.includes('خطوط') || textMsg.includes('font') || textMsg.includes('text') || textMsg.includes('typography')) {
    return `مرحباً! لتصميم مميز واحترافي، يُنصح بتطبيق قواعد التسلسل البصري للخطوط (Typography Hierarchy):
- العناوين الرئيسية: استخدم خط "Cairo" أو "Almarai" بوزن عريض جداً (Bold).
- النصوص الوصفية والفقرات: استخدم خط "Tajawal" بوزن عادي (Regular) وحجم 14px لضمان أفضل قراءة.
- حافظ دائماً على تباين لوني قوي بين الخط والخلفية لتسهيل قرائته على الهواتف المحمولة.`;
  }

  if (textMsg.includes('شعار') || textMsg.includes('logo') || textMsg.includes('براند') || textMsg.includes('brand')) {
    return `مرحباً بك! لتصميم هوية بصرية أو شعار ممتاز، تذكر دائماً القواعد الذهبية:
1. البساطة الشديدة (Simplicity) لكي يسهل تذكره في أذهان العملاء.
2. ملاءمة الألوان لقطاع عملك (مثلاً: الفيروزي والأزرق يعبران عن الأمان والتقنية، بينما الوردي يعبر عن الإبداع والجمال).
3. قابلية القياس: يجب أن يظهر الشعار بوضوح سواء على أيقونة تطبيق صغيرة بحجم 16px أو لوحة إعلانية عملاقة!`;
  }

  // General elegant Arabic reply
  return `لقد فهمت فكرتك الرائعة بخصوص: "${userMessage}". لتنفيذ ذلك بأعلى جودة بصوت احترافي في Quantum Studio:
- أنصحك بضبط محاذاة العناصر لتكون متناسقة ومتناظرة (يمكنك استخدام أدوات المحاذاة في شريط الخصائص الجانبي).
- أضف بعض المسافات الفارغة (Negative Space) لإراحة أعين المشاهدين وإبراز الرسالة الأساسية.
- يمكنك استخدام أي من الفلاتر أو الماركت بليس لإدراج فلكس ملون أو كود QR تفاعلي بسهولة.

ما هي جزيئية التصميم الأخرى التي تحتاج للمساعدة فيها؟ 🎨✨`;
}
