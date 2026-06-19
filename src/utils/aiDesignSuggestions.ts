import * as fabric from 'fabric';
import { setFeatureStatus } from './fixTracker';

export interface DesignSuggestion {
  id: string;
  type: 'color' | 'layout' | 'typography' | 'general';
  title: string;
  description: string;
  actionContent?: Record<string, any>;
}

export async function analyzeCanvasForSuggestions(canvasInfo: any): Promise<DesignSuggestion[]> {
  setFeatureStatus('design-suggestions', 'in-progress');
  
  const suggestions: DesignSuggestion[] = [];

  // Fallback programmatic heuristics based on object count and layout
  const numObjects = canvasInfo.objects?.length || 0;

  if (numObjects > 8) {
    suggestions.push({
      id: `sugg-${Date.now()}-1`,
      type: 'layout',
      title: 'تبسيط التصميم (Simplify Layout)',
      description: 'تصميمك يحتوي على عناصر كثيرة. حاول إضافة مساحات بيضاء (Negative space) لتبسيط الواجهة.',
    });
  }

  if (numObjects === 0) {
    suggestions.push({
      id: `sugg-${Date.now()}-2`,
      type: 'general',
      title: 'البداية المثالية',
      description: 'الكانفاس فارغ، هل ترغب في استخدام القوالب أو توليد فكرة باستخدام المساعد الذكي؟'
    });
  } else {
    suggestions.push({
      id: `sugg-${Date.now()}-3`,
      type: 'color',
      title: 'تناسق ألوان دافئ',
      description: 'جرّب تغيير لون الخلفية أو العناصر إلى تموجات دافئة (باستيل أو بنفسجي).',
      actionContent: {
        backgroundColor: '#7D3CFF'
      }
    });

    suggestions.push({
      id: `sugg-${Date.now()}-4`,
      type: 'typography',
      title: 'توحيد الخطوط',
      description: 'تأكد من استخدام خطين كحد أقصى (مثلاً: Cairo للعناوين الرئيسية، و Tajawal للفقرات) لتجنب التشتت.'
    });
  }

  setFeatureStatus('design-suggestions', 'fixed');
  return suggestions;
}
