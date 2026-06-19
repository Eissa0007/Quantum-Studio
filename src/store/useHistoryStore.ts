import { create } from 'zustand';

export interface HistoryAction {
  id: string;
  type: 'add' | 'modify' | 'remove' | 'clear' | 'unknown';
  description: string;
  timestamp: string;
  state: string; // serialized JSON
}

interface HistoryState {
  history: HistoryAction[];
  currentIndex: number;
  isUndoRedoInProgress: boolean;
  addHistoryAction: (action: Omit<HistoryAction, 'id' | 'timestamp'>) => void;
  undo: (canvas: any) => void;
  redo: (canvas: any) => void;
  jumpToHistory: (index: number, canvas: any) => void;
  setIsUndoRedoInProgress: (val: boolean) => void;
  clearHistory: () => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  isUndoRedoInProgress: false,
  lang: 'ar',
  setLang: (lang) => set({ lang }),
  setIsUndoRedoInProgress: (val) => set({ isUndoRedoInProgress: val }),

  addHistoryAction: (action) => {
    const state = get();
    if (state.isUndoRedoInProgress) return;

    const newAction: HistoryAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    const newHistory = [...state.history.slice(0, state.currentIndex + 1), newAction].slice(-100); // keep last 100
    
    set({
      history: newHistory,
      currentIndex: newHistory.length - 1
    });

    try {
      localStorage.setItem('quantum_canvas_history', JSON.stringify(newHistory));
    } catch(err) {}
  },

  undo: async (canvas) => {
    const state = get();
    if (state.currentIndex > 0) {
      const newIndex = state.currentIndex - 1;
      const targetState = state.history[newIndex]?.state;
      if (targetState && canvas) {
        set({ isUndoRedoInProgress: true });
        
        // Wait for canvas to load state
        return new Promise<void>((resolve) => {
           canvas.loadFromJSON(targetState, () => {
             canvas.renderAll();
             set({ currentIndex: newIndex, isUndoRedoInProgress: false });
             resolve();
           });
        });
      }
    }
  },

  redo: async (canvas) => {
    const state = get();
    if (state.currentIndex < state.history.length - 1) {
      const newIndex = state.currentIndex + 1;
      const targetState = state.history[newIndex]?.state;
      if (targetState && canvas) {
        set({ isUndoRedoInProgress: true });
        
        return new Promise<void>((resolve) => {
           canvas.loadFromJSON(targetState, () => {
             canvas.renderAll();
             set({ currentIndex: newIndex, isUndoRedoInProgress: false });
             resolve();
           });
        });
      }
    }
  },

  jumpToHistory: async (index, canvas) => {
    const state = get();
    if (index >= 0 && index < state.history.length) {
      const targetState = state.history[index]?.state;
      if (targetState && canvas) {
        set({ isUndoRedoInProgress: true });
        return new Promise<void>((resolve) => {
           canvas.loadFromJSON(targetState, () => {
             canvas.renderAll();
             set({ currentIndex: index, isUndoRedoInProgress: false });
             resolve();
           });
        });
      }
    }
  },

  clearHistory: () => {
     set({ history: [], currentIndex: -1 });
     localStorage.removeItem('quantum_canvas_history');
  }
}));
