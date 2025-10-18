import { create } from "zustand";
import type { StoryGraphDefinition } from "../graphs/node-types";
import { demoGraph } from "../graphs/node-types";
import type { StoryGraphDefinition } from "../graphs/node-types";
import sampleGraph from "../graphs/sample-graph.json" assert { type: "json" };

interface StoryGraphState {
  graph: StoryGraphDefinition;
  setGraph: (graph: StoryGraphDefinition) => void;
  updateGraph: (updater: (graph: StoryGraphDefinition) => StoryGraphDefinition) => void;
}

export const useStoryGraph = create<StoryGraphState>((set) => ({
  graph: sampleGraph as StoryGraphDefinition,
  setGraph: (graph) => set({ graph }),
  updateGraph: (updater) => set((state) => ({ graph: updater(state.graph) })),
}));
