import { useState, useEffect } from 'react';
import { Download, Loader2, X, Image as ImageIcon, FileText, CheckCircle2, Video } from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportCanvas } from '../utils/QuantumExportManager';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal = ({ onClose }: ExportModalProps) => {
  const { fabricCanvas, currentProject } = useStore();
  const [format, setFormat] = useState<'PNG' | 'JPG' | 'SVG' | 'PDF' | 'MP4' | 'GIF'>('PNG');
  const [quality, setQuality] = useState(0.9);
  const [transparentBg, setTransparentBg] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [addWatermark, setAddWatermark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState('0 KB');

  // Estimate file size based on format, dimensions and quality
  useEffect(() => {
    if (!fabricCanvas) return;
    const w = fabricCanvas.getWidth();
    const h = fabricCanvas.getHeight();
    const rawPixels = w * h;

    let sizeInBytes = 0;
    if (format === 'PNG') {
      sizeInBytes = rawPixels * 0.4 * (quality * 1.5);
    } else if (format === 'JPG') {
      sizeInBytes = rawPixels * 0.25 * quality;
    } else if (format === 'SVG') {
      sizeInBytes = fabricCanvas.getObjects().length * 1500 + 2000;
    } else {
      sizeInBytes = rawPixels * 0.3 * 1.4; // PDF wraps JPEG
    }

    const kb = sizeInBytes / 1024;
    if (kb > 1024) {
      setEstimatedSize(`${(kb / 1024).toFixed(2)} MB`);
    } else {
      setEstimatedSize(`${Math.round(kb)} KB`);
    }
  }, [format, quality, fabricCanvas]);

  const handleExport = async () => {
    if (!fabricCanvas) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const timestamp = Date.now();
      const baseName = currentProject?.title || 'quantum-studio-design';
      const fileName = `${baseName}-${timestamp}`;
      
      setProgressMsg('جاري تحضير ملفات اللوحة الفنية...');
      await new Promise(r => setTimeout(r, 400));
      
      setProgressMsg('جاري معالجة وتحديد العناصر والطبقات...');
      await new Promise(r => setTimeout(r, 400));

      setProgressMsg('جاري تصدير الملف بجودة وحجم مخصص...');
      
      await exportCanvas(fabricCanvas, {
        format: format as any,
        filename: fileName,
        quality: quality,
        transparentBg: transparentBg,
        backgroundColor: format === 'JPG' ? backgroundColor : undefined,
        watermark: addWatermark
      });
      setProgressMsg('تم توليد وتنزيل ملفك بنجاح!');
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError('حدث خطأ أثناء التصدير: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed border-0 inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 dark:border-gray-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">تصدير لوحة التصميم</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">احفظ وثيقتك الفنية بصيغ صور وفيكتور بجودة سحابية فائقة</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-500 hover:text-gray-800">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && <div className="text-red-500 bg-red-50 dark:bg-rose-950/20 p-3.5 rounded-xl text-xs font-bold border border-red-500/15">{error}</div>}
          
          {success ? (
            <div className="text-emerald-550 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl text-xs font-bold border border-emerald-500/15 text-center flex flex-col items-center gap-3">
              <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
              <span>{progressMsg} ✓ تم تحميل الملف وحفظه بنجاح على جهازك!</span>
            </div>
          ) : (
            <>
              {/* Export Formats Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-3">صيغة التصدير المستهدفة</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['PNG', 'JPG', 'SVG', 'PDF', 'MP4', 'GIF'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        format === f 
                          ? 'border-[#00C4CC] bg-[#00C4CC]/5 text-[#00C4CC]' 
                          : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {f === 'PDF' ? <FileText size={20} className="mb-1.5 text-red-500" /> : (f === 'MP4' || f === 'GIF') ? <Video size={20} className="mb-1.5 text-purple-500" /> : <ImageIcon size={20} className="mb-1.5 text-blue-500" />}
                      <span className="text-xs font-bold tracking-wider">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Information Display */}
              <div className="bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-gray-400">الحجم التقريبي للملف:</span>
                <span className="font-mono font-bold text-[#00C4CC] bg-[#00C4CC]/10 px-2.5 py-0.5 rounded-full">{estimatedSize}</span>
              </div>

              {/* Quality Settings slider */}
              {(format === 'PNG' || format === 'JPG') && (
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-400">أبعاد جودة التفاصيل</label>
                    <span className="text-xs font-mono font-bold text-indigo-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" max="1" step="0.1" 
                    value={quality} 
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-[#00C4CC] h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                    <span>دقة سريعة (أصغر حجم)</span>
                    <span>دقة كاملة (أعلى تمثيل)</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {format === 'PNG' && (
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <input 
                      type="checkbox" 
                      checked={transparentBg} 
                      onChange={(e) => setTransparentBg(e.target.checked)} 
                      className="rounded border-gray-300 text-[#00C4CC] focus:ring-[#00C4CC]"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">خلفية شفافة (Transparent Background)</span>
                  </label>
                )}

                {format === 'JPG' && (
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">لون الخلفية (Background Color)</span>
                    <input 
                      type="color" 
                      value={backgroundColor} 
                      onChange={(e) => setBackgroundColor(e.target.value)} 
                      className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <input 
                    type="checkbox" 
                    checked={addWatermark} 
                    onChange={(e) => setAddWatermark(e.target.checked)} 
                    className="rounded border-gray-300 text-[#7D3CFF] focus:ring-[#7D3CFF]"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إضافة علامة مائية (Watermark)</span>
                </label>
              </div>

              {/* Loading progress feedback */}
              {loading && (
                <div className="bg-indigo-500/10 border border-indigo-500/15 p-3.5 rounded-xl text-xs text-indigo-400 text-center flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#00C4CC]" />
                  <span>{progressMsg}</span>
                </div>
              )}

              {/* Main Submit Export Button */}
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white py-3.5 rounded-2xl font-bold hover:opacity-90 active:scale-[0.99] flex justify-center items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00C4CC]/10"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {loading ? 'جاري التصدير والتنزيل...' : 'تصدير وحفظ الملف'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
