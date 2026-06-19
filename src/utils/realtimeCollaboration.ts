import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import * as fabric from 'fabric';

interface Cursor {
  x: number;
  y: number;
  color: string;
  name: string;
  userId: string;
  isEditing: boolean;
}

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF3', '#FFB533'];

export const useRealtimeCollaboration = () => {
  const { currentProject, fabricCanvas, isConnected } = useStore();
  const [activeUsers, setActiveUsers] = useState<Record<string, Cursor>>({});
  const channelRef = useRef<any>(null);
  const myColor = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const myUserId = useRef(Math.random().toString(36).substring(7));
  const [lang, setLang] = useState<'ar'|'en'>('ar');
  const isUpdatingFromRemote = useRef(false);

  useEffect(() => {
    if (!supabase || !isConnected || !currentProject || !fabricCanvas) return;

    const channel = supabase.channel(`room:${currentProject.id}`, {
      config: {
        presence: { key: 'user' },
        broadcast: { ack: false }
      }
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Handle presence state updates here if needed (e.g. tracking who is online)
      })
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        setActiveUsers(prev => ({
          ...prev,
          [payload.payload.userId]: payload.payload
        }));
      })
      .on('broadcast', { event: 'selection-change' }, (payload) => {
         // handle selection UI hints for external users
      })
      .on('broadcast', { event: 'object-modified' }, (payload) => {
         if (!fabricCanvas) return;
         isUpdatingFromRemote.current = true;
         // Extremely simplified last-write-wins merging via full JSON replace or targeted updates
         // For a foundation, full canvas load is easiest but glitchy.
         // Let's do object level matching if possible by ID, but Fabric objects lack fixed IDs by default unless added.
         // Realistically, for this prototype, if it's a small canvas, we just reload it.
         if (payload.payload && payload.payload.state) {
            // Need Promise to ensure resolve completes before releasing lock
            new Promise<void>((resolve) => {
               fabricCanvas.loadFromJSON(payload.payload.state, () => {
                  fabricCanvas.renderAll();
                  setTimeout(() => { isUpdatingFromRemote.current = false; }, 100);
                  resolve();
               });
            });
         }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // Handle mouse move to broadcast cursor
    const handleMouseMove = (e: any) => {
      if (!channelRef.current || !fabricCanvas) return;
      const pointer = fabricCanvas.getPointer(e.e);
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          x: pointer.x,
          y: pointer.y,
          color: myColor.current,
          name: 'User ' + myUserId.current.substring(0, 4), // In real app, user auth name
          userId: myUserId.current,
          isEditing: false
        }
      });
    };

    const broadcastState = () => {
       if (!channelRef.current || !fabricCanvas || isUpdatingFromRemote.current) return;
       const state = fabricCanvas.toJSON(['id', 'selectable', 'locked', 'name']);
       channelRef.current.send({
         type: 'broadcast',
         event: 'object-modified',
         payload: { state }
       });
    };

    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('object:modified', broadcastState);
    fabricCanvas.on('object:added', broadcastState);
    fabricCanvas.on('object:removed', broadcastState);

    return () => {
      if (fabricCanvas) {
         fabricCanvas.off('mouse:move', handleMouseMove);
         fabricCanvas.off('object:modified', broadcastState);
         fabricCanvas.off('object:added', broadcastState);
         fabricCanvas.off('object:removed', broadcastState);
      }
      supabase.removeChannel(channel);
    };
  }, [currentProject, fabricCanvas, isConnected]);

  // Render external cursors onto the canvas or as overlays
  return { activeUsers, lang, setLang };
};
