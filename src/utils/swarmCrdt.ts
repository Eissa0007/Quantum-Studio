import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';

export interface CursorPosition {
  x: number;
  y: number;
  color: string;
  device: 'desktop' | 'touch' | 'vr';
  userId: string;
}

export interface SwarmPresence {
  cursor?: CursorPosition;
  user: { id: string; name: string };
  shardId: number;
  isActive: boolean;
}

export class SwarmCrdt {
  public doc: Y.Doc;
  public webrtcProvider: WebrtcProvider | null = null;
  public wsProvider: WebsocketProvider | null = null;
  public awareness: any = null;
  
  private maxPerShard = 50;
  private currentShardId = 0;
  private isLeader = false;

  constructor(public projectId: string, public user: { id: string, name: string }) {
    this.doc = new Y.Doc();
    
    // Auto-assign to a shard
    this.currentShardId = this.assignShard();
    this.connectToSwarm();
  }

  private assignShard(): number {
    // In a real system, you'd request a shard from the orchestrator API.
    // For now, we deterministically assign based on user id / random to simulate partitioning.
    return Math.floor(Math.random() * 200); 
  }

  public connectToSwarm() {
    const shardRoomId = `quantum-swarm-${this.projectId}-shard-${this.currentShardId}`;
    
    // Webrtc intra-shard mesh (max 50 users)
    this.webrtcProvider = new WebrtcProvider(shardRoomId, this.doc, {
      signaling: [
        'wss://signaling.yjs.dev', // Public signaling for demo
        'wss://y-webrtc-signaling-eu.herokuapp.com'
      ]
    });
    
    this.awareness = this.webrtcProvider.awareness;

    // Leader election simple simulation: first to connect or random probability.
    // In production, leaders would be elected deterministically (e.g. lowest client ID).
    this.isLeader = Math.random() > 0.8;

    if (this.isLeader) {
      // Connect to global WebSocket relay to sync across shards.
      // For demo, we use a public y-websocket server.
      this.wsProvider = new WebsocketProvider(
        'wss://demos.yjs.dev', 
        `quantum-global-${this.projectId}`, 
        this.doc
      );
    }
    
    this.updatePresence({
      user: this.user,
      shardId: this.currentShardId,
      isActive: true
    });
  }

  public updatePresence(state: Partial<SwarmPresence>) {
    if (this.awareness) {
      this.awareness.setLocalStateField('swarm', state);
    }
  }

  public getAwareness() {
    return this.awareness;
  }

  public updateCursor(x: number, y: number, color: string, device: 'desktop' | 'touch' | 'vr') {
    this.updatePresence({
      cursor: {
        x, y, color, device, userId: this.user.id
      }
    });
  }

  public disconnect() {
    this.webrtcProvider?.destroy();
    this.wsProvider?.destroy();
    this.doc.destroy();
  }

  // Helper method to get the shared canvas objects
  public getCanvasSharedState() {
    return this.doc.getMap('canvas_objects');
  }
}
