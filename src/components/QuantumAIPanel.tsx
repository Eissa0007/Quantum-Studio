import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { removeBackground } from '../utils/aiBackgroundRemover';
import { generateText } from '../utils/aiMagicWrite';
import { generateAIImage } from '../utils/aiImageGenerator';
import { askAIAssistant, ChatMessage } from '../utils/aiAssistantChat';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Wand2, 
  Image as LucideImage, 
  Scissors, 
  Loader2, 
  PlusCircle, 
  Bot,
  User,
  ExternalLink,
  Upload
} from 'lucide-react';
import * as fabric from 'fabric';

export const QuantumAIPanel = () => {
  const { fabricCanvas } = useStore();
  const [activeTab, setActiveTab] = useState<'assistant' | 'magic_write' | 'image_gen' | 'bg_remover'>('assistant');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);

  // States: AI Assistant
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "مرحباً يا بطل الإبداع! 🌌 أنا المساعد الذكي الخاص بك في كوانتوم.\nكيف يمكنني مساعدتك في ضبط الألوان، انتقاء الخطوط، أو هيكلة تصميمك الحالي لتفجير طاقتك الإبداعية؟",
      timestamp: new Date()
    }
  ]);

  // States: Magic Write
  const [writePrompt, setWritePrompt] = useState('');
  const [writeTone, setWriteTone] = useState('professional');
  const [writeLang, setWriteLang] = useState('ar');
  const [writeResult, setWriteResult] = useState('');

  // States: Image Gen
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgStyle, setImgStyle] = useState('realistic');
  const [imgResultUrl, setImgResultUrl] = useState('');

  // States: BG Remover
  const [bgInputUrl, setBgInputUrl] = useState('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400');
  const [bgRemovedUrl, setBgRemovedUrl] = useState('');

  // ------------------------------------------
  // HANDLERS: Assistant Chat
  // ------------------------------------------
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    const updatedMsgs = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);
    setChatInput('');
    setLoading(true);

    try {
      const response = await askAIAssistant(updatedMsgs);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // HANDLERS: Magic Write
  // ------------------------------------------
  const handleGenerateMagicWrite = async () => {
    if (!writePrompt.trim()) return;
    setLoading(true);
    setWriteResult('');
    try {
      const resultCopy = await generateText(writePrompt, writeTone, writeLang);
      setWriteResult(resultCopy);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addCopyToCanvas = () => {
    if (!writeResult || !fabricCanvas) return;
    const textbox = new fabric.Textbox(writeResult, {
      left: 80,
      top: 120,
      width: 280,
      fontSize: writeLang === 'ar' ? 20 : 16,
      fontFamily: writeLang === 'ar' ? 'Cairo' : 'Inter',
      fill: '#1E293B',
      textAlign: 'center',
      cornerColor: '#00C4CC',
      cornerStyle: 'circle'
    });
    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();
  };

  // ------------------------------------------
  // HANDLERS: Image Gen
  // ------------------------------------------
  const handleGenerateAIImage = async () => {
    if (!imgPrompt.trim()) return;
    setLoading(true);
    setImgResultUrl('');
    try {
      const result = await generateAIImage(imgPrompt, imgStyle);
      setImgResultUrl(result.url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addGeneratedImageToCanvas = () => {
    if (!imgResultUrl || !fabricCanvas) return;
    fabric.FabricImage.fromURL(imgResultUrl, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(220);
      img.set({
        left: 60,
        top: 60,
        cornerColor: '#00C4CC',
        cornerStyle: 'circle'
      });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    }).catch(err => {
      console.error("Failed to load generated AI Image to fabric", err);
    });
  };

  // ------------------------------------------
  // HANDLERS: Background Remover
  // ------------------------------------------
  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("يرجى اختيار ملف صورة صالح!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgInputUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    let targetUrl = bgInputUrl.trim();
    // Sanitize wrapping quotes
    if (targetUrl.startsWith('"') && targetUrl.endsWith('"')) {
      targetUrl = targetUrl.substring(1, targetUrl.length - 1).trim();
    }
    if (targetUrl.startsWith("'") && targetUrl.endsWith("'")) {
      targetUrl = targetUrl.substring(1, targetUrl.length - 1).trim();
    }
    
    // Check if it's a local file path
    const isLocalPath = /^[a-zA-Z]:[/\\]/i.test(targetUrl) || targetUrl.startsWith('/') || targetUrl.startsWith('file:');
    if (isLocalPath) {
      alert("عذراً، لا يمكن لمتصفح الويب قراءة ملفات جهازك المحلية مباشرة عبر الرابط. يرجى سحب وإفلات الصورة أو اختيار الملف مباشرة باستخدام زر الرفع أدناه لتشفيرها واستخدامها بنجاح!");
      return;
    }
    
    if (!targetUrl) return;
    setLoading(true);
    setBgRemovedUrl('');
    try {
      const resultBase64 = await removeBackground(targetUrl);
      setBgRemovedUrl(resultBase64);
    } catch (e) {
      console.error(e);
      alert("فشلت عملية تفريغ الخلفية لهذه الصورة. يرجى التأكد من صلاحية صورة الرابط وحاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  const addBgRemovedToCanvas = () => {
    if (!bgRemovedUrl || !fabricCanvas) return;
    
    fabric.FabricImage.fromURL(bgRemovedUrl, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(200);
      img.set({
        left: 70,
        top: 70,
        cornerColor: '#00C4CC',
        cornerStyle: 'circle'
      });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    }).catch(err => {
      console.error("Failed to load Transparent image", err);
      alert("عذراً، فشل تحميل الصورة الشفافة إلى الكانفاس. قد يعود السبب لقيود الحماية متقاطعة المصادر (CORS) أو تلف الرابط.");
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1A1A2E]" dir="rtl">
      
      {/* Dynamic Tab Pill Navigation */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 m-3 rounded-xl divide-x divide-transparent gap-0.5 text-[11px] font-bold">
        <button 
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'assistant' ? 'bg-white dark:bg-gray-800 text-[#7D3CFF] shadow-sm' : 'text-gray-500'}`}
        >
          شات AI
        </button>
        <button 
          onClick={() => setActiveTab('magic_write')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'magic_write' ? 'bg-white dark:bg-gray-800 text-[#7D3CFF] shadow-sm' : 'text-gray-500'}`}
        >
          كتابة ذكية
        </button>
        <button 
          onClick={() => setActiveTab('image_gen')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'image_gen' ? 'bg-white dark:bg-gray-800 text-[#7D3CFF] shadow-sm' : 'text-gray-500'}`}
        >
          مولد صور
        </button>
        <button 
          onClick={() => setActiveTab('bg_remover')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'bg_remover' ? 'bg-white dark:bg-gray-800 text-[#7D3CFF] shadow-sm' : 'text-gray-500'}`}
        >
          ممحاة الخلفية
        </button>
      </div>

      {/* Workspace scroll container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        
        {/* 1. STATE WORKSPACE: Assistant Chat */}
        {activeTab === 'assistant' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto mb-3 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${msg.sender === 'user' ? 'bg-[#00C4CC]' : 'bg-[#7D3CFF]'}`}>
                    {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-[#00C4CC]/10 text-gray-800 dark:text-gray-100 rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 max-w-[85%] ml-auto">
                  <div className="w-7 h-7 rounded-full bg-[#7D3CFF] flex items-center justify-center text-white">
                    <Loader2 size={13} className="animate-spin" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-400">
                    جاري التفكير وصياغة الرد...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              <input 
                type="text"
                placeholder="اسأل المساعد الذكي عن الألوان أو النصوص..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#7D3CFF]"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] hover:opacity-90 transition-opacity flex items-center justify-center text-white cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Send size={14} className="scale-x-[-1]" />
              </button>
            </div>
          </div>
        )}

        {/* 2. STATE WORKSPACE: Magic Write */}
        {activeTab === 'magic_write' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">فكرة أو سياق الكتابة:</label>
              <textarea 
                rows={3}
                placeholder="مثلاً: متجر بيتزا منزلي مع نكهات فريدة وتوصيل فوري..."
                value={writePrompt}
                onChange={(e) => setWritePrompt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-850 dark:text-white focus:outline-none focus:border-[#7D3CFF] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">نبرة الصوت (Tone):</label>
                <select 
                  value={writeTone}
                  onChange={(e) => setWriteTone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-[#7D3CFF]"
                >
                  <option value="professional">مهني / احترافي 💼</option>
                  <option value="creative">إبداعي / مشوق ✨</option>
                  <option value="persuasive">تنموي / مقنع 🤝</option>
                  <option value="urgent">لحوح / عاجل 🚨</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">لغة النصوص:</label>
                <select 
                  value={writeLang}
                  onChange={(e) => setWriteLang(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerateMagicWrite}
              disabled={loading || !writePrompt.trim()}
              className="w-full bg-[#7D3CFF] hover:bg-[#682ae6] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              <span>توليد النصوص بالذكاء الاصطناعي</span>
            </button>

            {writeResult && (
              <div className="p-3 bg-[#7D3CFF]/5 border border-[#7D3CFF]/20 rounded-xl relative">
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed italic">"{writeResult}"</p>
                <button 
                  onClick={addCopyToCanvas}
                  className="mt-3 bg-[#7D3CFF] hover:bg-[#682ae6] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={12} />
                  <span>إدراج في التصميم</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. STATE WORKSPACE: Image Gen */}
        {activeTab === 'image_gen' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">وصف الصورة المطلوبة (Prompt):</label>
              <input 
                type="text"
                placeholder="مثلاً: فضاء خارجي مجرد، ألوان نيون، فيكتور..."
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#7D3CFF]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">النمط البصري (Style):</label>
              <select 
                value={imgStyle}
                onChange={(e) => setImgStyle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl p-2 text-xs font-semibold focus:outline-none"
              >
                <option value="realistic">واقعي مجسم (Photorealistic)</option>
                <option value="cyberpunk">سايبربانك مستقبلي (Futuristic Neon)</option>
                <option value="vector">أيقوني مسطح (Minimal Vector)</option>
                <option value="isometric">رسم ثلاثي الأبعاد هندسي (Isometric 3D)</option>
              </select>
            </div>

            <button 
              onClick={handleGenerateAIImage}
              disabled={loading || !imgPrompt.trim()}
              className="w-full bg-[#7D3CFF] hover:bg-[#682ae6] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <LucideImage size={14} />}
              <span>توليد الصورة الذكية فورا</span>
            </button>

            {imgResultUrl && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 text-center">
                <img src={imgResultUrl} alt="AI Generated" className="mx-auto rounded-lg max-h-[140px] object-cover mb-3" />
                <button 
                  onClick={addGeneratedImageToCanvas}
                  className="w-full bg-[#00C4CC] hover:bg-[#00b0b8] text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={12} />
                  <span>إدراج في الكانفاس</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. STATE WORKSPACE: BG Remover */}
        {activeTab === 'bg_remover' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">رفع ملف صورة محلي أو إدخال رابط (URL):</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text"
                  placeholder="أدخل رابط خامة أو صورة..."
                  value={bgInputUrl}
                  onChange={(e) => setBgInputUrl(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
                  title="رفع ملف محلي"
                >
                  <Upload size={14} className="text-[#7D3CFF]" />
                  <span className="hidden sm:inline text-gray-600 dark:text-gray-400">اختر صورة</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleBgFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <span className="text-[9px] text-gray-400 font-medium block leading-relaxed">
                ملاحظة: لخدمة معالجة صور جهازك الخاصة (مثل unnamed.png)، اضغط على زر "اختر صورة" لتلقيمها محلياً وبشكل آمن وسريع!
              </span>
            </div>

            <button 
              onClick={handleRemoveBackground}
              disabled={loading || !bgInputUrl.trim()}
              className="w-full bg-[#7D3CFF] hover:bg-[#682ae6] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
              <span>تفريغ وحذف خلفية الصورة</span>
            </button>

            {bgRemovedUrl && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl text-center">
                <div className="text-[10px] text-gray-400 mb-2 font-bold">المعاينة الشفافة (Transformed):</div>
                <div className="bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:10px_10px] rounded-lg p-2 max-h-[120px] overflow-hidden flex items-center justify-center mb-3">
                  <img src={bgRemovedUrl} alt="Transparent BG result" className="max-h-[100px] object-contain" />
                </div>
                <button 
                  onClick={addBgRemovedToCanvas}
                  className="w-full bg-[#00C4CC] hover:bg-[#00b0b8] text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={12} />
                  <span>إدراج كعنصر مفرغ</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
