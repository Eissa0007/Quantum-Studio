import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useStore } from "../store/useStore";
import { useAutoSave } from "../hooks/useAutoSave";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { deserializeCanvas } from "../utils/canvasSerializer";
import { setupKeyboardShortcuts } from "../utils/keyboardShortcuts";
import { GridManager } from "../utils/gridManager";
import { Copy, Trash, Grid, Crosshair, Lock, Unlock, Layers, Undo, Redo, MousePointer2 } from "lucide-react";
import { useRealtimeCollaboration } from "../utils/realtimeCollaboration";

export const QuantumCanvas = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { fabricCanvas, setFabricCanvas, currentProject } = useStore();
  const [gridManager, setGridManager] = useState<GridManager | null>(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const { activeUsers } = useRealtimeCollaboration();

  useAutoSave();
  useCanvasHistory(fabricCanvas);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const dynamicCanvasEl = document.createElement("canvas");
    canvasContainerRef.current.appendChild(dynamicCanvasEl);

    const canvas = new fabric.Canvas(dynamicCanvasEl, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    setFabricCanvas(canvas);
    
    const manager = new GridManager(canvas);
    setGridManager(manager);

    if (
      currentProject &&
      currentProject.data &&
      Object.keys(currentProject.data).length > 0
    ) {
      deserializeCanvas(canvas, JSON.stringify(currentProject.data));
    } else {
      const text = new fabric.FabricText("مرحباً بك في كوانتوم!", {
        left: 250,
        top: 250,
        fill: "#7D3CFF",
        fontFamily: "Cairo",
      });
      canvas.add(text);
      canvas.renderAll();
    }

    // --- INFINITE PAN & ZOOM ---
    canvas.on('mouse:wheel', function(opt) {
      if (opt.e.ctrlKey || opt.e.metaKey) {
          let delta = opt.e.deltaY;
          let zoom = canvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 5) zoom = 5; // 500% max
          if (zoom < 0.1) zoom = 0.1; // 10% min
          canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY } as any, zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
      } else {
          // Pan
          const evt = opt.e as any;
          const vpt = canvas.viewportTransform;
          if (vpt) {
             vpt[4] -= evt.deltaX;
             vpt[5] -= evt.deltaY;
             canvas.requestRenderAll();
             canvas.setViewportTransform(vpt);
          }
      }
    });

    let isDragging = false;
    let lastPosX: number = 0;
    let lastPosY: number = 0;

    canvas.on('mouse:down', function(opt) {
      const evt = opt.e as MouseEvent;
      if (evt.altKey === true || evt.button === 1) { // Alt or middle click to drag
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:move', function(opt) {
      if (isDragging) {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
           vpt[4] += evt.clientX - lastPosX;
           vpt[5] += evt.clientY - lastPosY;
           canvas.requestRenderAll();
           lastPosX = evt.clientX;
           lastPosY = evt.clientY;
        }
      }
    });

    canvas.on('mouse:up', function(opt) {
      if (canvas.viewportTransform) {
         canvas.setViewportTransform(canvas.viewportTransform);
      }
      isDragging = false;
      canvas.selection = true;
    });

    // Setup shortcuts
    const cleanupShortcuts = setupKeyboardShortcuts(canvas);

    return () => {
      setFabricCanvas(null);
      if (cleanupShortcuts) cleanupShortcuts();

      const cleanup = async () => {
        try {
          canvas.renderAll = () => canvas;
          canvas.requestRenderAll = () => canvas;
          if (typeof (canvas as any).cancelRequestedRender === "function") {
            (canvas as any).cancelRequestedRender();
          }

          const disposeResult = canvas.dispose();
          if (disposeResult instanceof Promise) {
            await disposeResult;
          }
        } catch (err) {
          console.warn("Fabric Canvas dispose error handled safely:", err);
        } finally {
          if (canvasContainerRef.current) {
            canvasContainerRef.current.innerHTML = "";
          }
        }
      };
      cleanup();
    };
  }, [currentProject?.id]);

  // Handle rendering of cursors
  const renderCursors = () => {
    if (!fabricCanvas) return null;
    const vpt = fabricCanvas.viewportTransform;
    if (!vpt) return null;

    return Object.values(activeUsers).map(cursor => {
      // Apply viewport transform to exact coordinates to get DOM positions relative to the canvas container (roughly)
      // Actually because our container centers the canvas maybe? The fabric canvas has a width/height, but when we pan it changes the drawing inside it.
      // So DOM cursors need to be inside an absolute div that precisely matches the Fabric wrapper.
      // Using fabric's own rendering for cursors is also possible but DOM might be easier overlay.
      return (
        <div 
           key={cursor.userId}
           className="absolute pointer-events-none transition-all duration-100 ease-linear z-50 flex flex-col"
           style={{ 
             left: (cursor.x * vpt[0]) + vpt[4], 
             top: (cursor.y * vpt[3]) + vpt[5],
             transform: 'translate(-50%, -50%)'
           }}
        >
          <MousePointer2 fill={cursor.color} color={cursor.color} size={16} className="-ml-1 -mt-1" />
          <div 
             className="px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap text-xs font-bold text-white max-w-[120px] truncate"
             style={{ backgroundColor: cursor.color }}
          >
             {cursor.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-auto flex items-center justify-center relative touch-none bg-gray-50 dark:bg-gray-900 overflow-hidden text-right" dir="rtl">
      {/* Visual Workspace wrapper simulating an infinite board, the actual canvas creates its own limits if necessary */}
      <div className="relative">
        <div
          className="shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-white relative flex flex-col p-1 rounded-sm border border-gray-200 dark:border-gray-800"
          ref={canvasContainerRef}
        />
        {renderCursors()}
      </div>
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2 z-10">
        <button 
          onClick={() => {
            if (gridManager) {
              gridManager.toggleGrid();
              setGridVisible(gridManager.isVisible);
            }
          }}
          className={`p-2 rounded-lg transition-colors ${gridVisible ? 'bg-[#00C4CC]/20 text-[#00C4CC]' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
          title="تفعيل/إلغاء الشبكة"
        >
          <Grid size={18} />
        </button>
        <button 
          onClick={() => {
            if (gridManager) {
              gridManager.toggleSnap();
              setSnapEnabled(gridManager.isSnapEnabled);
            }
          }}
          className={`p-2 rounded-lg transition-colors ${snapEnabled ? 'bg-[#7D3CFF]/20 text-[#7D3CFF]' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
          title="تفعيل/إلغاء المحاذاة (Snap)"
        >
          <Crosshair size={18} />
        </button>
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />
        <button 
          onClick={() => {
            const active = fabricCanvas?.getActiveObjects();
            if (active && active.length > 0) {
              active.forEach(obj => {
                obj.lockMovementX = !obj.lockMovementX;
                obj.lockMovementY = !obj.lockMovementY;
                obj.lockRotation = !obj.lockRotation;
                obj.lockScalingX = !obj.lockScalingX;
                obj.lockScalingY = !obj.lockScalingY;
                obj.hasControls = !obj.lockMovementX;
              });
              fabricCanvas?.renderAll();
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          title="قفل/إلغاء قفل العناصر المحددة"
        >
          <Lock size={18} />
        </button>
        <button 
           onClick={() => {
            const active = fabricCanvas?.getActiveObjects();
            if (active && active.length > 0) {
              active.forEach(obj => fabricCanvas?.remove(obj));
              fabricCanvas?.discardActiveObject();
              fabricCanvas?.renderAll();
            }
          }}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
          title="حذف العناصر المحددة"
        >
          <Trash size={18} />
        </button>
      </div>
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 p-2 rounded-xl text-[10px] text-gray-500 shadow pointer-events-none backdrop-blur border border-gray-200 dark:border-gray-800">
        اضغط Alt + السحب للتنقل، Ctrl + Scroll للتقريب والمباعدة
      </div>
    </div>
  );
};
