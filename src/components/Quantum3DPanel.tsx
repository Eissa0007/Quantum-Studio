import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { Box, Play, Camera, RotateCcw, Sparkles } from 'lucide-react';
import { setFeatureStatus } from '../utils/fixTracker';

export const Quantum3DPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fabricCanvas } = useStore();
  const [productType, setProductType] = useState<'mug' | 'box' | 'cylinder'>('mug');
  const [pbrShine, setPbrShine] = useState<number>(0.8);
  const [pbrMetallic, setPbrMetallic] = useState<number>(0.2);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);

  // Keep references to update ThreeJS texture when canvas updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    setFeatureStatus('quantum-3d', 'in-progress');
    if (!containerRef.current) {
      setFeatureStatus('quantum-3d', 'fixed');
      return;
    }

    // 1. Initialize Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#141423'); // Elegant dark cosmic vibe

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / 240, // fix height aspect
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, 240);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight.position.set(-5, -5, 2);
    scene.add(pointLight);

    // 3. Texture mapping to fabric 2D canvas
    let textureCanvas: HTMLCanvasElement;
    if (fabricCanvas && fabricCanvas.getElement) {
      textureCanvas = fabricCanvas.getElement();
    } else {
      // Dummy backup canvas if no project open
      textureCanvas = document.createElement('canvas');
      textureCanvas.width = 256;
      textureCanvas.height = 256;
      const tCtx = textureCanvas.getContext('2d')!;
      tCtx.fillStyle = '#7D3CFF';
      tCtx.fillRect(0, 0, 256, 256);
      tCtx.fillStyle = '#ffffff';
      tCtx.font = '24px Arial';
      tCtx.fillText('Quantum Design', 40, 128);
    }

    const texture = new THREE.CanvasTexture(textureCanvas);
    textureRef.current = texture;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // 4. Create proper product geometry based on type
    let geometry: THREE.BufferGeometry;
    if (productType === 'mug') {
      geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    } else if (productType === 'box') {
      geometry = new THREE.BoxGeometry(1.6, 2, 0.4);
    } else {
      geometry = new THREE.CylinderGeometry(0.8, 0.8, 2.4, 32);
    }

    // Material with custom roughness and metallic controls
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1.0 - pbrShine,
      metalness: pbrMetallic,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Dynamic rotation drag mouse variables
    let isDragging = false;
    let prevMouseX = 0;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && mesh) {
        const deltaX = e.clientX - prevMouseX;
        mesh.rotation.y += deltaX * 0.01;
        prevMouseX = e.clientX;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 5. Animation loop
    let animeId: number;
    const animate = () => {
      animeId = requestAnimationFrame(animate);
      
      // Slow auto rotation if not dragging
      if (!isDragging && mesh) {
        mesh.rotation.y += 0.005;
      }

      // Check if we need to reload texture changes from canvas
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    setFeatureStatus('quantum-3d', 'fixed');

    // Cleanup
    return () => {
      cancelAnimationFrame(animeId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [productType, pbrShine, pbrMetallic, fabricCanvas]);

  const snapSnapshot = () => {
    if (rendererRef.current && sceneRef.current) {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      setCaptureUrl(dataUrl);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-slate-950 text-slate-100" dir="rtl">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-100 mb-1 flex items-center gap-1.5">
          <Sparkles size={16} className="text-[#00C4CC]" />
          أستوديو النمذجة ثلاثية الأبعاد
        </h3>
        <p className="text-xs text-gray-400">اعرض تصاميمك الحية مطبوعة على مجسمات ومنتجات حقيقية PBR</p>
      </div>

      {/* Render Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#141423] shadow-lg mb-4">
        <div ref={containerRef} className="w-full h-[240px]" />
        
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-bold text-[#00C4CC]">
          <Box size={12} className="animate-spin" />
          <span>WebGL بث مباشر ثلاثي الأبعاد</span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-2">
          <span className="text-[9px] text-slate-400 font-mono">اسحب بالماوس لتدوير المنتج</span>
          <button 
            onClick={snapSnapshot}
            className="p-1 px-2.5 bg-[#00C4CC] hover:bg-[#00b0b8] text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Camera size={11} />
            <span>لقطة معاينة</span>
          </button>
        </div>
      </div>

      {captureUrl && (
        <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-xl relative">
          <div className="text-[10px] text-gray-400 font-bold mb-2">الصورة الملتقطة للمجسم:</div>
          <img src={captureUrl} alt="3D Render" className="w-full rounded-lg border border-slate-800 shadow-inner max-h-[140px] object-contain bg-black/40" />
          <button 
            onClick={() => setCaptureUrl(null)}
            className="absolute top-4 left-4 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-650 cursor-pointer"
            title="حذف"
          >
            <RotateCcw size={10} />
          </button>
        </div>
      )}

      {/* Product Selectors */}
      <div className="space-y-4">
        <div>
          <span className="text-xs text-gray-400 block font-bold mb-1.5">اختر نوع المنتج للمعالجة:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mug', label: 'كوب سيراميك' },
              { id: 'box', label: 'صندوق هدايا' },
              { id: 'cylinder', label: 'عبوة معدنية' }
            ].map(prod => (
              <button
                key={prod.id}
                onClick={() => setProductType(prod.id as any)}
                className={`py-2 px-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  productType === prod.id
                    ? 'bg-[#00C4CC]/10 text-[#00C4CC] border-[#00C4CC]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {prod.label}
              </button>
            ))}
          </div>
        </div>

        {/* PBR settings properties */}
        <div className="space-y-3 pt-2 border-t border-slate-900">
          <span className="text-xs text-gray-400 block font-bold">خصائص المواد الحيوية (PBR):</span>
          
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
              <span>انعكاس ولمعان الخامة</span>
              <span>{Math.round(pbrShine * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={pbrShine}
              onChange={(e) => setPbrShine(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00C4CC]" 
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
              <span>بريق معدني (Metallic)</span>
              <span>{Math.round(pbrMetallic * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={pbrMetallic}
              onChange={(e) => setPbrMetallic(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#7D3CFF]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
