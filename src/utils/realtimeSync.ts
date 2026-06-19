import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { deserializeCanvas } from './canvasSerializer';

export const useRealtimeSync = () => {
  const { currentProject, fabricCanvas, isConnected } = useStore();

  useEffect(() => {
    if (!supabase || !isConnected || !currentProject || !fabricCanvas) return;

    // We subscribe to the `projects` table for the specific project
    const channel = supabase
      .channel(`project_${currentProject.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${currentProject.id}`,
        },
        (payload) => {
          // Verify if it's external update by checking updated_at or some other mechanism.
          // For now, simple blind load. In a real app we might diff or check source.
          if (payload.new && payload.new.data) {
            const dataStr = JSON.stringify(payload.new.data);
            deserializeCanvas(fabricCanvas, dataStr);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject, fabricCanvas, isConnected]);
};
