import { create } from "zustand";

interface ConnectionStore {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

/** Single source of truth for the app-wide websocket status (set once, from providers/providers.tsx). */
export const useConnectionStore = create<ConnectionStore>((set) => ({
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),
}));
