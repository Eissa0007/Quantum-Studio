import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { serializeCanvas } from '../utils/canvasSerializer';
import { supabase } from '../lib/supabase';
import { saveProjectLocally, OfflineQueueItem } from '../utils/offlineManager';
import { useOfflineSync } from './useOfflineSync';

export const useAutoSave = () => {
  const { fabricCanvas, currentProject, setSaveStatus, isConnected } = useStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isOnline } = useOfflineSync();

  const saveToDatabase = useCallback(async () => {
    if (!fabricCanvas || !currentProject) return;

    setSaveStatus('saving');
    try {
      const jsonStr = serializeCanvas(fabricCanvas);
      const data = JSON.parse(jsonStr);

      // Save locally to IndexedDB queue first
      await saveProjectLocally(currentProject.id, data, 'update');

      if (!isOnline || !isConnected || !supabase) {
        setSaveStatus('saved'); 
        console.log('محفوظ محلياً'); // Saved locally
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }

      const { data: currentDbProject, error: fetchError } = await supabase
        .from('projects')
        .select('updated_at')
        .eq('id', currentProject.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const { error } = await supabase
        .from('projects')
        .update({
          data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProject.id);

      if (error) throw error;
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to autosave project:', err);
      setSaveStatus('error');
    }
  }, [fabricCanvas, currentProject, isConnected, isOnline, setSaveStatus]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const onCanvasModified = () => {
      setSaveStatus('saving'); // show early indicator
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToDatabase();
      }, 5000); // 5 sec debounce
    };

    fabricCanvas.on('object:modified', onCanvasModified);
    fabricCanvas.on('object:added', onCanvasModified);
    fabricCanvas.on('object:removed', onCanvasModified);
    fabricCanvas.on('path:created', onCanvasModified);

    return () => {
      fabricCanvas.off('object:modified', onCanvasModified);
      fabricCanvas.off('object:added', onCanvasModified);
      fabricCanvas.off('object:removed', onCanvasModified);
      fabricCanvas.off('path:created', onCanvasModified);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [fabricCanvas, saveToDatabase, setSaveStatus]);

  return { saveToDatabase };
};

