import { useStore } from '../store/useStore';
import { Type, Play, Compass, Sparkles } from 'lucide-react';
import * as fabric from 'fabric';

export const QuantumTextPanel = () => {
  const { fabricCanvas } = useStore();

  const addTextToCanvas = (text: string, options: Partial<fabric.TextboxProps>) => {
    if (!fabricCanvas) return;

    const textbox = new fabric.Textbox(text, {
      left: 100,
      top: 100,
      width: 250,
      fontSize: 24,
      fontFamily: 'Inter',
      fill: '#333333',
      textAlign: 'center',
      cornerColor: '#00C4CC',
      cornerStyle: 'circle',
      transparentCorners: false,
      ...options
    });

    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();
  };

  const textPresets = [
    {
      label: 'عنوان رئيسي عريض',
      text: 'تبسيط الإبداع 🚀',
      style: {
        fontSize: 42,
        fontWeight: 'bold',
        fontFamily: 'Cairo',
        fill: '#1A1A2E'
      }
    },
    {
      label: 'عنوان فرعي أنيق',
      text: 'تصاميم المستقبل بين يديك',
      style: {
        fontSize: 24,
        fontWeight: 'normal',
        fontFamily: 'Cairo',
        fill: '#666666'
      }
    },
    {
      label: 'فقرة نصية عادية',
      text: 'هذا النص يمكن استبداله في أي وقت لكتابة ماتريد تقديمه لعملائك.',
      style: {
        fontSize: 14,
        fontFamily: 'Tajawal',
        fill: '#333333'
      }
    },
  ];

  const graphicPresets = [
    {
      title: 'شعاع النيون (Neon Cyber)',
      text: 'CYBERPUNK',
      style: {
        fontSize: 38,
        fontWeight: 'bold',
        fontFamily: 'Impact',
        fill: '#06b6d4',
        shadow: new fabric.Shadow({
          color: '#8b5cf6',
          blur: 15,
          offsetX: 0,
          offsetY: 0
        })
      }
    },
    {
      title: 'ملصق كرتوني (Cartoon Accent)',
      text: 'BOOM!',
      style: {
        fontSize: 48,
        fontWeight: '900',
        fontFamily: 'Comic Sans MS',
        fill: '#facc15',
        stroke: '#000000',
        strokeWidth: 2
      }
    },
    {
      title: 'تأثير أوبال (Aesthetic Opal)',
      text: 'QUERIES',
      style: {
        fontSize: 36,
        fontWeight: 'bold',
        fontFamily: 'Georgia',
        fill: '#FF6B9D',
        stroke: '#ffffff',
        strokeWidth: 1
      }
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto" dir="rtl">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">الخطوط والنصوص</h3>
        <p className="text-xs text-gray-500">أضف خطوطاً مميزة وعناوين تسويقية جذابة إلى لوحة تخطيطك</p>
      </div>

      {/* Simple elements builders */}
      <div className="space-y-2 mb-6">
        <button 
          onClick={() => addTextToCanvas('أضف عنواناً', { fontSize: 36, fontWeight: 'bold', fontFamily: 'Cairo' })}
          className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 h-12 flex items-center gap-3 rounded-xl transition-all font-bold text-sm text-gray-800 dark:text-gray-100 cursor-pointer"
        >
          <div className="text-lg font-extrabold text-[#7D3CFF]">T</div>
          <span>أضف عنوان رئيسي</span>
        </button>

        <button 
          onClick={() => addTextToCanvas('أضف عنواناً فرعياً', { fontSize: 22, fontWeight: '500', fontFamily: 'Cairo' })}
          className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 h-11 flex items-center gap-3 rounded-xl transition-all font-semibold text-xs text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <div className="text-sm font-bold text-[#00C4CC]">T</div>
          <span>أضف عنوان فرعي</span>
        </button>

        <button 
          onClick={() => addTextToCanvas('اكتب فقرتك الوصفية هنا...', { fontSize: 13, fontFamily: 'Tajawal' })}
          className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 h-10 flex items-center gap-3 rounded-xl transition-all text-xs text-gray-500 dark:text-gray-300 cursor-pointer"
        >
          <div className="text-xs text-gray-400">T</div>
          <span>أضف فقرة نصية عادية</span>
        </button>
      </div>

      {/* Text presets collections */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
        <Compass size={14} className="text-[#00C4CC]" />
        <span>قوالب الخطوط العربية الجاهزة</span>
      </div>

      <div className="space-y-2 mb-6">
        {textPresets.map((preset, i) => (
          <div 
            key={i}
            onClick={() => addTextToCanvas(preset.text, preset.style)}
            className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/40 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800/85 rounded-xl cursor-pointer hover:border-[#00C4CC] transition-all"
          >
            <div className="text-[10px] text-gray-400 font-bold mb-1">{preset.label}</div>
            <div 
              style={{ fontFamily: preset.style.fontFamily, color: preset.style.fill }}
              className="text-sm select-none"
            >
              {preset.text}
            </div>
          </div>
        ))}
      </div>

      {/* Designer presets / stylized effects */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-400">
        <Sparkles size={14} className="text-[#7D3CFF]" />
        <span>تأثيرات ونصوص فنية احترافية</span>
      </div>

      <div className="space-y-2">
        {graphicPresets.map((preset, i) => (
          <div 
            key={i}
            onClick={() => addTextToCanvas(preset.text, preset.style)}
            className="p-3 bg-gray-900 text-white rounded-xl cursor-pointer border border-transparent hover:border-[#8b5cf6] transition-all flex justify-between items-center"
          >
            <div>
              <span className="text-[10px] text-gray-400 block font-bold mb-0.5">{preset.title}</span>
              <span className="text-sm font-bold font-mono tracking-tight" style={{ color: preset.style.fill }}>{preset.text}</span>
            </div>
            <Play size={10} className="text-[#8b5cf6]" />
          </div>
        ))}
      </div>
    </div>
  );
};
