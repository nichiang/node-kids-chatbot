import { StoryEditorNodeType } from "../graphs/node-types";

const phaseGroups: Record<string, StoryEditorNodeType[]> = {
  "Topic Discovery": [
    "topic-classifier",
    "opening-story-prompt",
    "theme-recommender",
  ],
  "Design Collaboration": [
    "design-trigger",
    "entity-naming-prompt",
    "character-detail-prompt",
    "setting-detail-prompt",
    "design-completion-handler",
  ],
  "Story Development": [
    "learner-turn-recorder",
    "feedback-coach",
    "narrative-assessment",
    "conflict-guidance",
    "continuation-prompt",
    "story-state-updater",
  ],
  "Completion & Restart": [
    "ending-evaluator",
    "finale-prompt",
    "restart-invitation",
    "session-reset",
  ],
  "Vocabulary Practice": [
    "vocabulary-intro",
    "vocabulary-question-prompt",
    "vocabulary-completion",
  ],
  "Utilities": [
    "session-manager",
    "telemetry-logger",
    "vocabulary-tracker",
    "response-assembler",
  ],
};

export function NodePalette() {
  return (
    <aside className="node-palette">
      <h2>Node Palette</h2>
      {Object.entries(phaseGroups).map(([phase, nodeIds]) => (
        <section key={phase}>
          <h3>{phase}</h3>
          <ul>
            {nodeIds.map((nodeId) => (
              <li key={nodeId} data-node-type={nodeId}>
                {toDisplayName(nodeId)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

function toDisplayName(nodeId: StoryEditorNodeType): string {
  return nodeId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
