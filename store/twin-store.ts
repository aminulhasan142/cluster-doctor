import { create } from "zustand";

interface TwinStore {
  selectedRoom: string | null;
  selectedRack: string | null;
  selectedNodeId: string | null;

  setSelectedRoom: (room: string | null) => void;
  setSelectedRack: (rack: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  reset: () => void;
}

export const useTwinStore = create<TwinStore>((set) => ({
  selectedRoom: null,
  selectedRack: null,
  selectedNodeId: null,

  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setSelectedRack: (rack) => set({ selectedRack: rack }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  reset: () =>
    set({
      selectedRoom: null,
      selectedRack: null,
      selectedNodeId: null,
    }),
}));
