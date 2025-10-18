import { create } from "zustand";
import type { StoryGraphDefinition, StoryGraphNode, StoryGraphEdge } from "../graphs/node-types";
import sampleGraph from "../graphs/sample-graph.json" assert { type: "json" };

const STORAGE_KEY = "story-editor-graph";

function normalizeGraph(graph: any): StoryGraphDefinition {
  if (!graph || typeof graph !== "object") {
    return sampleGraph as StoryGraphDefinition;
  }
  const nodes: StoryGraphNode[] = Array.isArray(graph.nodes)
    ? graph.nodes.filter((node: StoryGraphNode) => node && node.id && node.type)
    : [];
  const edges: StoryGraphEdge[] = Array.isArray(graph.edges)
    ? graph.edges.filter((edge: StoryGraphEdge) => edge && edge.id && edge.source && edge.target)
    : [];

  return {
    id: graph.id ?? "story-graph",
    label: graph.label ?? "Story Graph",
    nodes,
    edges,
  } as StoryGraphDefinition;
}

function loadGraph(): StoryGraphDefinition {
  if (typeof window === "undefined") {
    return sampleGraph as StoryGraphDefinition;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return sampleGraph as StoryGraphDefinition;
    }
    return normalizeGraph(JSON.parse(raw));
  } catch (error) {
    console.warn("Failed to load story graph from storage", error);
    return sampleGraph as StoryGraphDefinition;
  }
}

function saveGraph(graph: StoryGraphDefinition) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
  } catch (error) {
    console.warn("Failed to persist story graph", error);
  }
}

interface StoryGraphState {
  graph: StoryGraphDefinition;
  setGraph: (graph: StoryGraphDefinition) => void;
  updateGraph: (updater: (graph: StoryGraphDefinition) => StoryGraphDefinition) => void;
  removeNodes: (nodeIds: string[]) => void;
  removeEdges: (edgeIds: string[]) => void;
}

export const useStoryGraph = create<StoryGraphState>((set) => ({
  graph: loadGraph(),
  setGraph: (graph) => {
    const normalized = normalizeGraph(graph);
    saveGraph(normalized);
    set({ graph: normalized });
  },
  updateGraph: (updater) => set((state) => {
    const nextGraph = normalizeGraph(updater(state.graph));
    saveGraph(nextGraph);
    return { graph: nextGraph };
  }),
  removeNodes: (nodeIds) => set((state) => {
    const filteredNodes = state.graph.nodes.filter((node) => !nodeIds.includes(node.id));
    const filteredEdges = state.graph.edges.filter(
      (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target),
    );
    const nextGraph = normalizeGraph({
      ...state.graph,
      nodes: filteredNodes,
      edges: filteredEdges,
    });
    saveGraph(nextGraph);
    return { graph: nextGraph };
  }),
  removeEdges: (edgeIds) => set((state) => {
    const filteredEdges = state.graph.edges.filter((edge) => !edgeIds.includes(edge.id));
    const nextGraph = normalizeGraph({
      ...state.graph,
      edges: filteredEdges,
    });
    saveGraph(nextGraph);
    return { graph: nextGraph };
  }),
}));
