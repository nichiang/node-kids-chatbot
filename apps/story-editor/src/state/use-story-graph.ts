import { create } from "zustand";
import type { StoryGraphDefinition } from "../graphs/node-types";
import { demoGraph } from "../graphs/node-types";

interface StoryGraphState {
  graph: StoryGraphDefinition;
  setGraph: (graph: StoryGraphDefinition) => void;
}

export const useStoryGraph = create<StoryGraphState>((set) => ({
  graph: demoGraph,
  setGraph: (graph) => set({ graph }),
}));
