import { create } from "zustand";

interface SelectionState {
  selectedNodeId?: string;
  setSelectedNodeId: (id?: string) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedNodeId: undefined,
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
}));
