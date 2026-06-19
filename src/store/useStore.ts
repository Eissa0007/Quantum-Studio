import { create } from "zustand";

interface Project {
  id: string;
  title: string;
  data: any;
  thumbnail_url?: string;
  updated_at?: string;
}

interface AppState {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  fabricCanvas: any | null;
  setFabricCanvas: (canvas: any) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showAuditDashboard: boolean;
  setShowAuditDashboard: (show: boolean) => void;
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  activePanel: "none",
  setActivePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? "none" : panel,
    })),
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  saveStatus: "idle",
  setSaveStatus: (status) => set({ saveStatus: status }),
  fabricCanvas: null,
  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
  showAuditDashboard: false,
  setShowAuditDashboard: (show) => set({ showAuditDashboard: show }),
  showShortcutsModal: false,
  setShowShortcutsModal: (show) => set({ showShortcutsModal: show }),
  showExportModal: false,
  setShowExportModal: (show) => set({ showExportModal: show }),
}));
