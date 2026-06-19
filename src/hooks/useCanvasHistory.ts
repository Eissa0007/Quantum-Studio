import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useHistoryStore } from '../store/useHistoryStore';
import { serializeCanvas } from '../utils/canvasSerializer';

export const useCanvasHistory = (canvas: fabric.Canvas | null) => {
  const { addHistoryAction, setIsUndoRedoInProgress, isUndoRedoInProgress } = useHistoryStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!canvas) return;

    // Load history from local storage on mount if empty
    try {
      const saved = localStorage.getItem('quantum_canvas_history');
      if (saved && useHistoryStore.getState().history.length === 0) {
        const parsed = JSON.parse(saved);
        useHistoryStore.setState({ history: parsed, currentIndex: parsed.length - 1 });
      }
    } catch(err) {}

    const saveState = (type: 'add' | 'modify' | 'remove' | 'clear', descAr: string, descEn: string) => {
      if (isUndoRedoInProgress) return;
      const state = serializeCanvas(canvas);
      
      const lang = useHistoryStore.getState().lang;
      
      addHistoryAction({
        type,
        description: lang === 'ar' ? descAr : descEn,
        state
      });
    };

    const onObjectAdded = (e: any) => {
       if (e.target && !e.target.excludeFromExport) {
          saveState('add', 'تم إدراج عنصر جديد', 'Added new element');
       }
    };

    const onObjectModified = (e: any) => {
       if (e.target) {
          saveState('modify', 'تم تعديل عنصر', 'Modified element');
       }
    };

    const onObjectRemoved = (e: any) => {
       if (e.target && !e.target.excludeFromExport) {
          saveState('remove', 'تم حذف عنصر', 'Removed element');
       }
    };

    const onCanvasCleared = () => {
       saveState('clear', 'تم مسح لوحة العمل', 'Cleared canvas');
    };

    canvas.on('object:added', onObjectAdded);
    canvas.on('object:modified', onObjectModified);
    canvas.on('object:removed', onObjectRemoved);
    canvas.on('canvas:cleared', onCanvasCleared);

    // Initial state on load
    if (!isInitialized.current) {
       setTimeout(() => {
          if (!isUndoRedoInProgress) {
             const state = serializeCanvas(canvas);
             addHistoryAction({
                type: 'add',
                description: useHistoryStore.getState().lang === 'ar' ? 'بدء المشروع' : 'Start Project',
                state
             });
             isInitialized.current = true;
          }
       }, 500);
    }

    return () => {
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:modified', onObjectModified);
      canvas.off('object:removed', onObjectRemoved);
      canvas.off('canvas:cleared', onCanvasCleared);
    };
  }, [canvas, isUndoRedoInProgress, addHistoryAction]);

};
