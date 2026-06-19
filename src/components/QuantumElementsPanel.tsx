import { useState, useEffect } from "react";
import { Search, Loader2, Image as ImageIcon, Video, Palette, Sparkles, Smile, ShieldAlert, Heart, Play } from "lucide-react";
import { useStore } from "../store/useStore";
import { freeIcons } from "../data/freeIcons";
import { getIllustrationsByCategory } from "../data/freeIllustrations";
import { searchUnsplashPhotos } from "../utils/unsplashIntegration";
import { searchPexelsPhotos, searchPexelsVideos } from "../utils/pexelsIntegration";
import { searchPixabayPhotos, searchPixabayVideos, searchPixabayIllustrations } from "../utils/pixabayIntegration";
import * as LucideIcons from "lucide-react";
import * as fabric from "fabric";

export const QuantumElementsPanel = () => {
  const [lang, setLang] = useState<'ar'|'en'>('ar');
  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "illustrations" | "icons" | "shapes">("photos");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Loaded results
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [illustrations, setIllustrations] = useState<any[]>([]);
  
  // Providers selected by user
  const [photoProvider, setPhotoProvider] = useState<"pexels" | "unsplash" | "pixabay">("pexels");
  const [videoProvider, setVideoProvider] = useState<"pexels" | "pixabay">("pexels");
  const [illustrationProvider, setIllustrationProvider] = useState<"pixabay" | "local">("pixabay");

  const { fabricCanvas } = useStore();

  const localIllustrations = getIllustrationsByCategory("All");

  // Initial load when tab shifts or providers shift
  useEffect(() => {
    handleRunSearch();
  }, [activeTab, photoProvider, videoProvider, illustrationProvider]);

  const handleRunSearch = async (query = searchQuery) => {
    setLoading(true);
    setErrorMessage(null);
    const searchVal = query.trim() || "creative";
    
    try {
      if (activeTab === "photos") {
        if (photoProvider === "pexels") {
          const results = await searchPexelsPhotos(searchVal, 1, 24);
          const formatted = results.map((img: any) => ({
            id: img.id,
            url: img.src?.large || img.url,
            thumbnail: img.src?.medium || img.thumbnail,
            full: img.src?.original || img.full,
            author: img.photographer || "Pexels Creator",
            source: "pexels"
          }));
          setPhotos(formatted);
        } else if (photoProvider === "unsplash") {
          const results = await searchUnsplashPhotos(searchVal, 1, 24);
          const formatted = results.map((img: any) => ({
            id: img.id,
            url: img.urls?.regular || img.url,
            thumbnail: img.urls?.thumb || img.thumbnail,
            full: img.urls?.full || img.full,
            author: img.user?.name || "Unsplash Creator",
            source: "unsplash"
          }));
          setPhotos(formatted);
        } else {
          const results = await searchPixabayPhotos(searchVal, 1, 24);
          const formatted = results.map((img: any) => ({
            id: img.id,
            url: img.webformatURL || img.url,
            thumbnail: img.previewURL || img.thumbnail,
            full: img.largeImageURL || img.full,
            author: img.user || "Pixabay Creator",
            source: "pixabay"
          }));
          setPhotos(formatted);
        }
      } else if (activeTab === "videos") {
        if (videoProvider === "pexels") {
          const results = await searchPexelsVideos(searchVal, 1, 20);
          const formatted = results.map((vid: any) => ({
            id: vid.id,
            url: vid.video_files?.[0]?.link || "",
            thumbnail: vid.image,
            author: vid.user?.name || "Pexels Videos",
            source: "pexels"
          }));
          setVideos(formatted);
        } else {
          const results = await searchPixabayVideos(searchVal, 1, 20);
          const formatted = results.map((vid: any) => ({
            id: vid.id,
            url: vid.videos?.medium?.url || "",
            thumbnail: `https://i.vimeocdn.com/video/${vid.picture_id}_640x360.jpg` || "",
            author: vid.user || "Pixabay Videos",
            source: "pixabay"
          }));
          setVideos(formatted);
        }
      } else if (activeTab === "illustrations") {
        if (illustrationProvider === "pixabay") {
          const results = await searchPixabayIllustrations(searchVal, 1, 24);
          const formatted = results.map((illus: any) => ({
            id: illus.id,
            url: illus.webformatURL || illus.url,
            thumbnail: illus.previewURL || illus.thumbnail,
            full: illus.largeImageURL || illus.full,
            author: illus.user || "Pixabay Generator",
            source: "pixabay"
          }));
          setIllustrations(formatted);
        } else {
          setIllustrations(localIllustrations);
        }
      }
    } catch (err: any) {
      console.error("API Fetch Error:", err);
      setErrorMessage("عذراً، فشل استدعاء البيانات الحية للخدمة السحابية. تم تفعيل الوضع التجريبي التلقائي.");
    } finally {
      setLoading(false);
    }
  };

  // Add SVG elements or custom Lucide icons to fabric Canvas
  const addIconToCanvas = (iconName: string) => {
    if (!fabricCanvas) return;
    const canvas = fabricCanvas as any;
    
    // Create fabric text as placeholder
    const text = new fabric.FabricText(iconName, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fill: "#7D3CFF",
      fontSize: 40,
      fontFamily: "Space Grotesk",
      originX: "center",
      originY: "center"
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Ultimate image canvas loader requested in task
  const addImageToCanvas = async (imageUrl: string) => {
    if (!fabricCanvas) return;
    const canvas = fabricCanvas as any;
    
    setLoading(true);
    try {
      const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      if (img.width > canvasWidth || img.height > canvasHeight) {
        const scale = Math.min(
          canvasWidth / img.width,
          canvasHeight / img.height
        );
        img.set({
          scaleX: scale * 0.7,
          scaleY: scale * 0.7
        });
      } else {
        img.scale(0.5);
      }

      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center"
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIcons = freeIcons.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F1419] text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header and Lang Toggle */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-bold">{lang === 'ar' ? 'العناصر' : 'Elements'}</h3>
           <button 
             onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
             className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
           >
             {lang === 'ar' ? 'EN' : 'AR'}
           </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap bg-gray-100 dark:bg-[#1A1A2E] rounded-xl p-1 mb-4 gap-1">
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === "photos" ? "bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ImageIcon size={12} />
            الصور
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === "videos" ? "bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Video size={12} />
            الفيديو
          </button>
          <button
            onClick={() => setActiveTab("illustrations")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === "illustrations" ? "bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Palette size={12} />
            الرسومات
          </button>
          <button
            onClick={() => setActiveTab("icons")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === "icons" ? "bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Smile size={12} />
            أيقونات
          </button>
          <button
            onClick={() => setActiveTab("shapes")}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === "shapes" ? "bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Sparkles size={12} />
            أشكال
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="ابحث عن عناصر ومكعبات هندسية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunSearch()}
            className="w-full bg-gray-100 dark:bg-[#1A1A2E] text-xs rounded-xl py-2.5 pr-9 pl-4 border border-transparent focus:bg-white dark:focus:bg-[#0F1419] focus:border-[#00C4CC] transition-all outline-none"
          />
        </div>

        {/* Brand Providers Selectors */}
        {activeTab === "photos" && (
          <div className="flex gap-1.5 mt-3 justify-center flex-wrap">
            <button
              onClick={() => setPhotoProvider("pexels")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${photoProvider === "pexels" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              Pexels
            </button>
            <button
              onClick={() => setPhotoProvider("unsplash")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${photoProvider === "unsplash" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              Unsplash
            </button>
            <button
              onClick={() => setPhotoProvider("pixabay")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${photoProvider === "pixabay" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              Pixabay
            </button>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="flex gap-1.5 mt-3 justify-center">
            <button
              onClick={() => setVideoProvider("pexels")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${videoProvider === "pexels" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              Pexels Videos
            </button>
            <button
              onClick={() => setVideoProvider("pixabay")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${videoProvider === "pixabay" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              Pixabay Videos
            </button>
          </div>
        )}

        {activeTab === "illustrations" && (
          <div className="flex gap-1.5 mt-3 justify-center">
            <button
              onClick={() => setIllustrationProvider("pixabay")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${illustrationProvider === "pixabay" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              رسومات Pixabay
            </button>
            <button
              onClick={() => setIllustrationProvider("local")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${illustrationProvider === "local" ? "bg-[#00C4CC]/20 text-[#00C4CC] border border-[#00C4CC]/35" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
            >
              مكتبة النظام الحرة
            </button>
          </div>
        )}
      </div>

      {/* Main Results grid */}
      <div className="flex-1 overflow-y-auto p-4 select-none">
        
        {/* Soft API Alert Warning */}
        {errorMessage && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-500 flex items-center gap-2">
            <ShieldAlert size={16} className="flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-[#00C4CC]" size={36} />
            <span className="text-xs text-gray-400 font-bold">جاري تحميل الأصول الفنية للمشروع...</span>
          </div>
        ) : (
          <>
            {/* 1. Photos Display */}
            {activeTab === "photos" && (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => addImageToCanvas(photo.full)}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-gray-100 dark:bg-gray-800 border dark:border-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    title="أنقر للإضافة إلى لوحة التصميم"
                  >
                    <img
                      src={photo.thumbnail}
                      alt="photograph"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                      <span className="text-[9px] text-white font-medium truncate">
                        👤 {photo.author}
                      </span>
                      <span className="bg-[#00C4CC] text-white px-1.5 py-0.5 rounded text-[8px] uppercase font-bold">
                        {photo.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Videos Display */}
            {activeTab === "videos" && (
              <div className="grid grid-cols-2 gap-2">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => addImageToCanvas(vid.thumbnail)} // Render thumbnail directly on the workspace for high fidelity
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-gray-100 dark:bg-gray-800 border dark:border-gray-800 hover:scale-[1.02] transition-transform"
                    title="أنقر للإضافة كصورة متحركة للوحة"
                  >
                    <img
                      src={vid.thumbnail}
                      alt="video preview"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-black/50 group-hover:bg-black/75 flex items-center justify-center text-white transition-all shadow">
                        <Play size={14} className="mr-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                      <span className="text-[9px] text-white font-medium truncate">
                        👤 {vid.author}
                      </span>
                      <span className="bg-[#7D3CFF] text-white px-1.5 py-0.5 rounded text-[8px] font-bold">
                        {vid.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Illustrations Display */}
            {activeTab === "illustrations" && (
              <div className="grid grid-cols-2 gap-2">
                {illustrations.map((ill) => {
                  const isLocal = !ill.source;
                  return (
                    <div
                      key={ill.id}
                      onClick={() => addImageToCanvas(ill.url)}
                      className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/25 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
                      title="أنقر للإضافة إلى لوحة التصميم"
                    >
                      <img
                        src={ill.url || ill.thumbnail}
                        alt={ill.name || "Illustration"}
                        className="w-full h-24 object-contain mb-2"
                        loading="lazy"
                      />
                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold text-center line-clamp-1">
                        {ill.name || `رسمة ${ill.author}`}
                      </span>
                      {!isLocal && (
                        <span className="bg-[#00C4CC]/10 text-[#00C4CC] px-1 py-0.2 rounded text-[8px] font-bold mt-1">
                          {ill.source}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. Icons Display */}
            {activeTab === "icons" && (
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.slice(0, 100).map((iconName) => {
                  const IconComp = (LucideIcons as any)[iconName];
                  return IconComp ? (
                    <button
                      key={iconName}
                      onClick={() => addIconToCanvas(iconName)}
                      className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border border-gray-100 dark:border-gray-850"
                      title={iconName}
                    >
                      <IconComp size={20} strokeWidth={1.5} />
                    </button>
                  ) : null;
                })}
              </div>
            )}

            {/* 5. Shapes Display */}
            {activeTab === "shapes" && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                     if (!fabricCanvas) return;
                     const rect = new fabric.Rect({ left: 100, top: 100, fill: '#7D3CFF', width: 100, height: 100 });
                     fabricCanvas.add(rect);
                     fabricCanvas.setActiveObject(rect);
                  }}
                  className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-10 h-10 bg-[#7D3CFF]"></div>
                </button>
                <button
                  onClick={() => {
                     if (!fabricCanvas) return;
                     const circle = new fabric.Circle({ left: 100, top: 100, fill: '#00C4CC', radius: 50 });
                     fabricCanvas.add(circle);
                     fabricCanvas.setActiveObject(circle);
                  }}
                  className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-10 h-10 bg-[#00C4CC] rounded-full"></div>
                </button>
                <button
                  onClick={() => {
                     if (!fabricCanvas) return;
                     const triangle = new fabric.Triangle({ left: 100, top: 100, fill: '#FF5733', width: 100, height: 100 });
                     fabricCanvas.add(triangle);
                     fabricCanvas.setActiveObject(triangle);
                  }}
                  className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-0 h-0 border-l-[25px] border-l-transparent border-b-[50px] border-[#FF5733] border-r-[25px] border-r-transparent"></div>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
