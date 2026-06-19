import { useState, useRef } from 'react';
import { Upload, Trash2, Image as LucideImage, FolderPlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as fabric from 'fabric';

export const QuantumUploadsPanel = () => {
  const { fabricCanvas } = useStore();
  const [uploads, setUploads] = useState<string[]>(() => {
    // default presets
    return [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', // abstraction
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', // technology
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'  // gradient aesthetic
    ];
  });
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageToCanvas = (url: string) => {
    if (!fabricCanvas) return;
    
    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(200);
      img.set({
        left: 50,
        top: 50,
        cornerColor: '#00C4CC',
        cornerStyle: 'circle',
        transparentCorners: false
      });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    }).catch(err => {
      console.error("Failed to add image", err);
      // fallback draw if CORS blocked Unsplash proxy
      const imgEl = new Image();
      imgEl.onload = () => {
        const fabImg = new fabric.FabricImage(imgEl, {
          left: 50,
          top: 50,
        });
        fabImg.scaleToWidth(200);
        fabricCanvas.add(fabImg);
        fabricCanvas.setActiveObject(fabImg);
        fabricCanvas.renderAll();
      };
      imgEl.src = url;
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploads(prev => [e.target!.result as string, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const deleteUpload = (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploads(prev => prev.filter((_, idx) => idx !== idxToDelete));
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto" dir="rtl">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">رفع الوسائط السحابية</h3>
        <p className="text-xs text-gray-500">ارفع صورك الخاصة بصيغة PNG أو JPG لاستخدامها في التصميم</p>
      </div>

      {/* Drag & Drop selector stage */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          dragging 
            ? 'border-[#00C4CC] bg-[#00C4CC]/5' 
            : 'border-gray-200 dark:border-gray-800 hover:border-[#00C4CC]'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-[#00C4CC]">
          <Upload size={18} />
        </div>
        <p className="text-xs font-bold text-gray-800 dark:text-white">اسحب الصور هنا أو تصفح ملفاتك</p>
        <span className="text-[10px] text-gray-400">يدعم PNG, JPG, WebP حتى 10 ميجابايت</span>
      </div>

      <div className="h-6" />

      {/* Uploads list or library */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-400">
          <LucideImage size={14} />
          <span>مكتبة الصور المرفوعة ({uploads.length})</span>
        </div>

        {uploads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <FolderPlus size={36} className="text-gray-300 dark:text-gray-700 mb-2" />
            <span className="text-xs">لا توجد صور حالياً</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uploads.map((url, idx) => (
              <div 
                key={idx}
                onClick={() => addImageToCanvas(url)}
                className="group relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60 overflow-hidden cursor-pointer hover:ring-2 ring-[#00C4CC] transition-all flex items-center justify-center"
              >
                <img 
                  src={url} 
                  alt="Uploaded Asset" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Delete button layer hover */}
                <button
                  onClick={(e) => deleteUpload(idx, e)}
                  className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                  title="حذف الصورة"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
