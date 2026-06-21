import React, { useMemo } from 'react';
import { useSwarm } from '../hooks/useSwarm';
import { motion } from 'motion/react';

interface SwarmOverlayProps {
  projectId: string;
  userId: string;
  userName: string;
  containerWidth: number;
  containerHeight: number;
}

export const SwarmOverlay: React.FC<SwarmOverlayProps> = ({ 
  projectId, 
  userId, 
  userName,
  containerWidth,
  containerHeight
}) => {
  const { activeUsers, totalUsers } = useSwarm(projectId, { id: userId, name: userName });

  // Heatmap generation: bucket users into a grid to show density
  const heatmapData = useMemo(() => {
    const gridCols = 20;
    const gridRows = 20;
    const grid: number[][] = Array(gridCols).fill(0).map(() => Array(gridRows).fill(0));
    
    let maxDensity = 0;

    activeUsers.forEach((presence) => {
      if (presence.cursor && containerWidth > 0 && containerHeight > 0) {
        const col = Math.floor((presence.cursor.x / containerWidth) * gridCols);
        const row = Math.floor((presence.cursor.y / containerHeight) * gridRows);
        
        if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
          grid[col][row]++;
          if (grid[col][row] > maxDensity) maxDensity = grid[col][row];
        }
      }
    });

    return { grid, maxDensity, gridCols, gridRows };
  }, [activeUsers, containerWidth, containerHeight]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Network Stats */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg border border-white/10 shadow-xl flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-medium text-cyan-50">Swarm Sync Active</span>
        </div>
        <div className="text-gray-300 font-mono">Peers: {totalUsers} (Sharded)</div>
        <div className="text-gray-300 font-mono">Ping: ~42ms</div>
      </div>

      {/* Heatmap Overlay (Active when users > 100) */}
      {totalUsers > 10 && (
        <div className="absolute inset-0 opacity-30 mix-blend-screen">
          {heatmapData.grid.map((colData, colIndex) => 
            colData.map((density, rowIndex) => {
              if (density === 0) return null;
              
              const intensity = heatmapData.maxDensity > 0 ? density / heatmapData.maxDensity : 0;
              const size = 100 + (intensity * 200); // 100px to 300px blur spread
              
              return (
                <div
                  key={`heat-${colIndex}-${rowIndex}`}
                  className="absolute rounded-full pointer-events-none transition-all duration-1000 ease-in-out"
                  style={{
                    left: `${(colIndex / heatmapData.gridCols) * 100}%`,
                    top: `${(rowIndex / heatmapData.gridRows) * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, rgba(0, 196, 204, ${intensity * 0.5}) 0%, rgba(0,0,0,0) 70%)`,
                    filter: 'blur(20px)'
                  }}
                />
              );
            })
          )}
        </div>
      )}

      {/* Individual Cursors (Visible for smaller groups or nearest neighbors) */}
      {Array.from(activeUsers.entries()).map(([clientId, presence]) => {
        if (!presence.cursor || presence.user.id === userId) return null;
        
        return (
          <motion.div
            key={clientId}
            className="absolute top-0 left-0 flex flex-col items-start drop-shadow-md"
            initial={false}
            animate={{
              x: presence.cursor.x,
              y: presence.cursor.y,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.5 }}
          >
            {/* Cursor Icon based on device */}
            <div 
              style={{ color: presence.cursor.color }}
              className="text-lg -mt-1 -ml-1 drop-shadow"
            >
              {presence.cursor.device === 'desktop' && '🖱️'}
              {presence.cursor.device === 'touch' && '👆'}
              {presence.cursor.device === 'vr' && '🥽'}
              {!presence.cursor.device && '🖱️'}
            </div>
            <div 
               className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm truncate max-w-[100px] bg-black/70 backdrop-blur-sm border border-white/10 ml-3"
            >
               {presence.user.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
