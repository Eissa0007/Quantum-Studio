import { useEffect, useState, useRef } from 'react';
import { SwarmCrdt, SwarmPresence, CursorPosition } from '../utils/swarmCrdt';

export function useSwarm(projectId: string, user: { id: string, name: string }) {
  const [swarm, setSwarm] = useState<SwarmCrdt | null>(null);
  const [activeUsers, setActiveUsers] = useState<Map<number, SwarmPresence>>(new Map());
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (!projectId || !user.id) return;

    const newSwarm = new SwarmCrdt(projectId, user);
    setSwarm(newSwarm);

    const awareness = newSwarm.getAwareness();

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const usersMap = new Map<number, SwarmPresence>();
      
      states.forEach((state: any, clientId: number) => {
        if (state.swarm) {
          usersMap.set(clientId, state.swarm as SwarmPresence);
        }
      });
      
      setActiveUsers(new Map(usersMap));
      setTotalUsers(states.size);
    };

    awareness.on('change', handleAwarenessChange);
    
    // Initial fetch
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
      newSwarm.disconnect();
    };
  }, [projectId, user.id, user.name]);

  const updateCursor = (x: number, y: number, color: string, device: 'desktop' | 'touch' | 'vr' = 'desktop') => {
    if (swarm) {
      swarm.updateCursor(x, y, color, device);
    }
  };

  return {
    swarm,
    activeUsers,
    totalUsers,
    updateCursor
  };
}
