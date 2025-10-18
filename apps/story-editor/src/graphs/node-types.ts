export type StoryEditorNodeType =
  | "topic-classifier"
  | "opening-story-prompt"
  | "theme-recommender"
  | "design-trigger"
  | "entity-naming-prompt"
  | "character-detail-prompt"
  | "setting-detail-prompt"
  | "design-completion-handler"
  | "learner-turn-recorder"
  | "feedback-coach"
  | "narrative-assessment"
  | "conflict-guidance"
  | "continuation-prompt"
  | "story-state-updater"
  | "ending-evaluator"
  | "finale-prompt"
  | "restart-invitation"
  | "session-reset"
  | "vocabulary-intro"
  | "vocabulary-question-prompt"
  | "vocabulary-completion"
  | "session-manager"
  | "telemetry-logger"
  | "vocabulary-tracker"
  | "response-assembler";

export interface StoryGraphNode {
  id: string;
  type: StoryEditorNodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface StoryGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface StoryGraphDefinition {
  id: string;
  label: string;
  nodes: StoryGraphNode[];
  edges: StoryGraphEdge[];
}
	export const demoGraph: StoryGraphDefinition = {
  id: "story-prototype",
  label: "Story Prototype",
  nodes: [
    {
      id: "node-1",
      type: "topic-classifier",
      position: { x: 0, y: 0 },
      data: { description: "Detects topic keywords from opening turn" },
    },
    {
      id: "node-2",
      type: "opening-story-prompt",
      position: { x: 200, y: 0 },
      data: { promptRef: "story.opening" },
    },
    {
      id: "node-3",
      type: "continuation-prompt",
      position: { x: 400, y: 0 },
      data: { promptRef: "story.continuation" },
    },
    {
      id: "node-4",
      type: "finale-prompt",
      position: { x: 600, y: 0 },
      data: { promptRef: "story.finale" },
    },
  ],
  edges: [
    { id: "edge-1", source: "node-1", target: "node-2" },
    { id: "edge-2", source: "node-2", target: "node-3" },
    { id: "edge-3", source: "node-3", target: "node-4" },
  ],
};
