import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  QrCode, 
  Palette, 
  Paintbrush, 
  FileText, 
  PlusCircle, 
  Smile, 
  ArrowLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import QRCode from 'qrcode';
import * as fabric from 'fabric';

// Helper function to render a Lucide icon component to an SVG string
const renderIconToSVG = (IconComponent: any, color: string = '#000000', size: number = 64) => {
  const iconNode = IconComponent.iconNode || [];
  let childrenHtml = '';
  
  if (Array.isArray(iconNode)) {
    iconNode.forEach(([tag, attrs]: [string, any]) => {
      let attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
      childrenHtml += `<${tag} ${attrStr} />`;
    });
  } else {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${childrenHtml}
  </svg>`;
};

export const QuantumPluginMarketplace = () => {
  const { fabricCanvas } = useStore();
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar'|'en'>('ar');

  // States: QR Code Plugin
  const [qrText, setQrText] = useState('https://ai.studio/build');
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');

  // States: Color Palette
  const generatePalette = () => {
    const hue = Math.floor(Math.random() * 360);
    return [
      `hsl(${hue}, 70%, 20%)`,
      `hsl(${hue}, 70%, 40%)`,
      `hsl(${hue}, 70%, 60%)`,
      `hsl(${hue}, 70%, 80%)`,
      `hsl(${hue}, 70%, 95%)`,
    ];
  };
  const [generatedPalette, setGeneratedPalette] = useState<string[]>(generatePalette());

  // States: Gradient
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [color1, setColor1] = useState('#FF6B9D');
  const [color2, setColor2] = useState('#7D3CFF');
  const [color3, setColor3] = useState('#00C4CC');

  // States: Lorem Ipsum Plugin
  const [loremLang, setLoremLang] = useState<'ar' | 'en'>('ar');
  const [loremType, setLoremType] = useState<'words' | 'sentences' | 'paragraphs'>('sentences');
  const [loremCount, setLoremCount] = useState(2);

  // States: Icon Finder
  const [iconSearch, setIconSearch] = useState('');
  const [iconColor, setIconColor] = useState('#333333');

  const plugins = [
    { id: 'qrcode', name: lang === 'ar' ? 'منشئ رموز QR' : 'QR Code Generator', desc: lang === 'ar' ? 'توليد رموز استجابة سريعة وتخصيص ألوانها.' : 'Generate customizable QR codes.', icon: QrCode, color: 'text-indigo-400' },
    { id: 'palette', name: lang === 'ar' ? 'استوديو الألوان' : 'Color Palette Studio', desc: lang === 'ar' ? 'توليد أطقم ألوان ذكية متناسقة لمعالجة التصاميم.' : 'Generate smart color palettes.', icon: Palette, color: 'text-emerald-400' },
    { id: 'gradient', name: lang === 'ar' ? 'مصمم التدرجات' : 'Gradient Designer', desc: lang === 'ar' ? 'إنشاء تدرجات لونية ثنائية كخلفيات للتصميم.' : 'Create complex gradient backgrounds.', icon: Paintbrush, color: 'text-[#00C4CC]' },
    { id: 'lorem', name: lang === 'ar' ? 'مولد النصوص العشوائية' : 'Lorem Ipsum Filler', desc: lang === 'ar' ? 'نصوص معبأة بالعربية والإنجليزية.' : 'Dummy text blocks in Arabic and English.', icon: FileText, color: 'text-amber-400' },
    { id: 'icons', name: lang === 'ar' ? 'مستكشف الأيقونات' : 'Icon Finder', desc: lang === 'ar' ? 'بحث شامل في مئات الأيقونات لإدراجها حية.' : 'Search and insert professional icons.', icon: Smile, color: 'text-[#FF6B9D]' },
  ];

  // 1. QR Code generator
  const handleGenerateQRCode = async () => {
    if (!qrText || !fabricCanvas) return;
    try {
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: qrSize,
        margin: 1,
        color: {
          dark: qrColor,
          light: qrBgColor
        }
      });

      fabric.FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: 100,
          top: 100,
        });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    } catch (err) {
      console.error("Generator QR Code error", err);
    }
  };

  // 2. Color Palette applicator
  const applyPalette = (colors: string[]) => {
    if (!fabricCanvas) return;
    fabricCanvas.backgroundColor = colors[4];
    const activeObj = fabricCanvas.getActiveObject();
    if (activeObj && (activeObj as any).set) {
      (activeObj as any).set('fill', colors[0]);
    }
    fabricCanvas.renderAll();
  };

  // 3. Gradient designer
  const applyGradient = () => {
    if (!fabricCanvas) return;

    const width = fabricCanvas.getWidth();
    const height = fabricCanvas.getHeight();
    let grad;

    if (gradType === 'linear') {
      grad = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: width, y2: height },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 0.5, color: color3 },
          { offset: 1, color: color2 }
        ]
      });
    } else {
      const min = Math.min(width, height);
      grad = new fabric.Gradient({
        type: 'radial',
        coords: { 
          r1: 0, r2: min / 2, 
          x1: width/2, y1: height/2,
          x2: width/2, y2: height/2
        },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 0.5, color: color3 },
          { offset: 1, color: color2 }
        ]
      });
    }

    fabricCanvas.backgroundColor = grad;
    fabricCanvas.renderAll();
  };

  // 4. Lorem ipsum writer
  const injectLoremIpsum = () => {
    if (!fabricCanvas) return;

    let textStr = '';
    const wordAr = ['نص', 'مؤقت', 'عشوائي', 'اختبار', 'تجربة', 'لوريم', 'إيبسوم'];
    const wordEn = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing'];

    if (loremType === 'words') {
      const words = loremLang === 'ar' ? wordAr : wordEn;
      for (let i = 0; i < loremCount; i++) textStr += words[i % words.length] + ' ';
    } else if (loremType === 'sentences') {
      const sentAr = 'لوريم إيبسوم هو ببساطة نص مؤقت يُستخدم في صناعات الطباعة.';
      const sentEn = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      for (let i = 0; i < loremCount; i++) textStr += (loremLang === 'ar' ? sentAr : sentEn) + ' ';
    } else {
      const pAr = 'لوريم إيبسوم هو ببساطة نص مؤقت يُستخدم في صناعات الطباعة والتنضيد البصري.\n\n';
      const pEn = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n';
      for (let i = 0; i < loremCount; i++) textStr += (loremLang === 'ar' ? pAr : pEn);
    }

    const text = new fabric.Textbox(textStr.trim(), {
      left: 100,
      top: 100,
      width: 300,
      fontSize: 20,
      fontFamily: loremLang === 'ar' ? 'Cairo' : 'Inter',
      fill: '#333333',
      textAlign: loremLang === 'ar' ? 'right' : 'left'
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  // 5. Icon creator
  const injectIcon = (iconName: string) => {
    if (!fabricCanvas) return;
    
    const iconNode = (LucideIcons as any)[iconName];
    if (!iconNode) return;
    
    const svgStr = renderIconToSVG(iconNode, iconColor, 100);

    fabric.loadSVGFromString(svgStr).then((result) => {
       const iconGroup = fabric.util.groupSVGElements(result.objects, result.options);
       iconGroup.set({ left: 100, top: 100 });
       fabricCanvas.add(iconGroup);
       fabricCanvas.setActiveObject(iconGroup);
       fabricCanvas.renderAll();
    });
  };
  
  // Icon search logic
  const iconNames = Object.keys(LucideIcons).filter(k => k !== 'createLucideIcon' && k !== 'default' && k !== 'icons');
  const filteredIcons = iconSearch ? iconNames.filter(k => k.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 20) : iconNames.slice(0, 20);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white dark:bg-[#1A1A2E]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
         {selectedPlugin ? (
            <button 
              onClick={() => setSelectedPlugin(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{lang === 'ar' ? 'العودة' : 'Back'}</span>
            </button>
         ) : (
            <div>
               <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{lang === 'ar' ? 'المتجر والتطبيقات' : 'Plugin Store'}</h3>
            </div>
         )}
         <button 
           onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
           className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
         >
           {lang === 'ar' ? 'EN' : 'AR'}
         </button>
      </div>

      {!selectedPlugin ? (
        <div className="space-y-3">
          {plugins.map(p => {
            const Icon = p.icon;
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedPlugin(p.id)}
                className="p-3 bg-gray-50 dark:bg-gray-900/60 hover:bg-[#8b5cf6]/5 border border-gray-150 dark:border-gray-850 rounded-2xl cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="flex gap-3">
                  <div className={`p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 ${p.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#8b5cf6] transition-colors">{p.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{p.desc}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-450 self-center" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 pt-1 animate-fade-in">
          
          {selectedPlugin === 'qrcode' && (
            <div className="space-y-4">
              <input 
                type="text" 
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder={lang === 'ar' ? 'الرابط للرمز' : 'URL or Text'}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs"
              />
              <div className="flex gap-2">
                 <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} className="w-8 h-8" title="QR Color" />
                 <input type="color" value={qrBgColor} onChange={e => setQrBgColor(e.target.value)} className="w-8 h-8" title="Background Color" />
              </div>
              <input 
                type="range" min="100" max="400" step="50" value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full"
              />
              <button 
                onClick={handleGenerateQRCode}
                className="w-full bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold"
              >
                {lang === 'ar' ? 'إدراج QR' : 'Add QR Code'}
              </button>
            </div>
          )}

          {selectedPlugin === 'palette' && (
            <div className="space-y-4">
              <button onClick={() => setGeneratedPalette(generatePalette())} className="text-xs bg-gray-100 p-2 rounded w-full">
                {lang === 'ar' ? 'توليد ألوان جديدة' : 'Generate New'}
              </button>
              <div className="flex h-10 rounded-lg overflow-hidden cursor-pointer" onClick={() => applyPalette(generatedPalette)}>
                {generatedPalette.map((c, idx) => (
                  <div key={idx} className="flex-1 h-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}

          {selectedPlugin === 'gradient' && (
            <div className="space-y-4">
              <select value={gradType} onChange={e => setGradType(e.target.value as any)} className="w-full p-2 text-xs">
                 <option value="linear">Linear</option>
                 <option value="radial">Radial</option>
              </select>
              <div className="flex gap-2">
                 <input type="color" value={color1} onChange={e => setColor1(e.target.value)} />
                 <input type="color" value={color3} onChange={e => setColor3(e.target.value)} />
                 <input type="color" value={color2} onChange={e => setColor2(e.target.value)} />
              </div>
              <button onClick={applyGradient} className="w-full bg-[#00C4CC] text-white py-2 rounded-xl text-xs">
                {lang === 'ar' ? 'تطبيق كخلفية' : 'Apply Background'}
              </button>
            </div>
          )}

          {selectedPlugin === 'lorem' && (
            <div className="space-y-4">
              <select value={loremLang} onChange={e => setLoremLang(e.target.value as any)} className="w-full p-2 text-xs">
                 <option value="ar">Arabic</option>
                 <option value="en">English</option>
              </select>
              <select value={loremType} onChange={e => setLoremType(e.target.value as any)} className="w-full p-2 text-xs">
                 <option value="words">Words</option>
                 <option value="sentences">Sentences</option>
                 <option value="paragraphs">Paragraphs</option>
              </select>
              <input type="number" min="1" max="100" value={loremCount} onChange={e => setLoremCount(parseInt(e.target.value))} className="w-full p-2" />
              <button onClick={injectLoremIpsum} className="w-full bg-amber-500 text-white py-2 rounded-xl text-xs">
                {lang === 'ar' ? 'إدراج نص' : 'Insert Text'}
              </button>
            </div>
          )}

          {selectedPlugin === 'icons' && (
            <div className="space-y-4">
              <div className="flex items-center bg-gray-50 p-2 rounded-xl border">
                 <Search size={14} className="text-gray-400" />
                 <input 
                   type="text" 
                   value={iconSearch} 
                   onChange={e => setIconSearch(e.target.value)} 
                   placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                   className="bg-transparent border-none outline-none text-xs mr-2 w-full"
                 />
              </div>
              <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} title="Icon Color" />
              <div className="grid grid-cols-4 gap-2">
                 {filteredIcons.map(name => {
                    const Comp = (LucideIcons as any)[name];
                    return (
                       <div key={name} onClick={() => injectIcon(name)} className="p-2 border cursor-pointer hover:bg-gray-100 flex items-center justify-center rounded">
                          <Comp size={20} color={iconColor} />
                       </div>
                    );
                 })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
