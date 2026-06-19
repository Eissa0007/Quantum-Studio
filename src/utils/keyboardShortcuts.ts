import * as fabric from 'fabric';
import { useStore } from '../store/useStore';
import { useHistoryStore } from '../store/useHistoryStore';

let clipboard: fabric.FabricObject | null = null;
let customShortcuts = {
  save: 's',
  undo: 'z',
  redo: 'y',
  copy: 'c',
  paste: 'v',
  duplicate: 'd',
  selectAll: 'a',
  group: 'g',
  export: 'e'
};

export function setupKeyboardShortcuts(canvas: fabric.Canvas) {
  if (!canvas || typeof window === 'undefined') {
    return;
  }

  try {
     const saved = localStorage.getItem('quantum_shortcuts');
     if (saved) customShortcuts = JSON.parse(saved);
  } catch(e) {}

  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if user is typing in an input element
    const activeEl = document.activeElement;
    if (
      activeEl && 
      (activeEl.tagName === 'INPUT' || 
       activeEl.tagName === 'TEXTAREA' || 
       activeEl.getAttribute('contenteditable') === 'true')
    ) {
      return;
    }

    const { currentProject, setSaveStatus, setShowAuditDashboard } = useStore.getState();
    const { undo, redo } = useHistoryStore.getState();
    const activeObjects = canvas.getActiveObjects();
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
    const key = e.key.toLowerCase();

    // Show shortcuts modal
    if (e.key === '?') {
       useStore.setState({ showShortcutsModal: true } as any);
       return;
    }

    // Ctrl+S → Save project (force save)
    if (cmdCtrl && key === customShortcuts.save) {
      e.preventDefault();
      const saveHook = document.getElementById('force-save-btn');
      if (saveHook) saveHook.click(); // trigger via hidden btn or global store mechanism
      else setSaveStatus('saved');
    }

    // Ctrl+Z → Undo
    if (cmdCtrl && key === customShortcuts.undo && !e.shiftKey) {
      e.preventDefault();
      undo(canvas);
    }
    
    // Ctrl+Shift+Z / Ctrl+Y → Redo
    if ((cmdCtrl && e.shiftKey && key === customShortcuts.undo) || (cmdCtrl && key === customShortcuts.redo)) {
      e.preventDefault();
      redo(canvas);
    }

    // Delete/Backspace → Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (activeObjects.length > 0) {
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    }

    // Ctrl+C → Copy
    if (cmdCtrl && key === customShortcuts.copy) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.clone().then((cloned) => {
          clipboard = cloned;
        });
      }
    }

    // Ctrl+V → Paste
    if (cmdCtrl && key === customShortcuts.paste) {
      if (clipboard) {
        clipboard.clone().then((clonedObj: any) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: (clonedObj.left || 0) + 20,
            top: (clonedObj.top || 0) + 20,
            evented: true,
          });
          
          if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj: any) => {
              canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          
          canvas.setActiveObject(clonedObj);
          canvas.renderAll();
        });
      }
    }

    // Ctrl+D → Duplicate
    if (cmdCtrl && key === customShortcuts.duplicate) {
      e.preventDefault();
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
         activeObject.clone().then((clonedObj: any) => {
            canvas.discardActiveObject();
            clonedObj.set({
              left: (clonedObj.left || 0) + 20,
              top: (clonedObj.top || 0) + 20,
              evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
              clonedObj.canvas = canvas;
              clonedObj.forEachObject((obj: any) => canvas.add(obj));
              clonedObj.setCoords();
            } else {
              canvas.add(clonedObj);
            }
            canvas.setActiveObject(clonedObj);
            canvas.renderAll();
         });
      }
    }

    // Ctrl+A → Select all
    if (cmdCtrl && key === customShortcuts.selectAll) {
      e.preventDefault();
      canvas.discardActiveObject();
      const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas });
      canvas.setActiveObject(sel);
      canvas.renderAll();
    }

    // Ctrl+G / Ctrl+Shift+G → Group/Ungroup
    if (cmdCtrl && key === customShortcuts.group) {
      e.preventDefault();
      if (!e.shiftKey) {
        // Group
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'activeSelection') {
           const objects = (activeObj as any).getObjects();
           (activeObj as any).canvas?.discardActiveObject();
           const group = new fabric.Group(objects);
           canvas.add(group);
           canvas.setActiveObject(group);
           canvas.requestRenderAll();
        }
      } else {
        // Ungroup
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'group') {
           const items = (activeObj as fabric.Group).getObjects();
           (activeObj as any).destroy?.(); // if provided 
           canvas.remove(activeObj);
           const sel = new fabric.ActiveSelection(items, { canvas });
           canvas.setActiveObject(sel);
           canvas.requestRenderAll();
        }
      }
    }

    // Ctrl+E → Export
    if (cmdCtrl && key === customShortcuts.export) {
        e.preventDefault();
        useStore.setState({ showExportModal: true } as any);
    }
    
    // Zoom in/out (+/-)
    if (e.key === '=' || e.key === '+' || e.key === '-') {
       e.preventDefault();
       let zoom = canvas.getZoom();
       if (e.key === '-') zoom *= 0.9;
       else zoom *= 1.1;
       if (zoom > 5) zoom = 5;
       if (zoom < 0.1) zoom = 0.1;
       canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoom);
    }

    // Ctrl+0 → Reset focus
    if (cmdCtrl && e.key === '0') {
       e.preventDefault();
       canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
       canvas.requestRenderAll();
    }

    // F11 → Fullscreen
    if (e.key === 'F11') {
       e.preventDefault();
       if (!document.fullscreenElement) {
         document.documentElement.requestFullscreen();
       } else {
         if (document.exitFullscreen) document.exitFullscreen();
       }
    }
    
    // Space+Drag is handled in QuantumCanvas.tsx via mouse events natively, we can just detect Space
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    // Handling space bar panning is tricky with just key up/down. Handled via Alt in QuantumCanvas, but let's toggle a pan mode via Space
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}
