import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import type { StoryEditorNodeType } from "../graphs/node-types";

type NodeData = {
  description?: string;
  promptRef?: string;
};

type StoryNodeProps = NodeProps<NodeData> & { label: string };

function BaseNode({ data, label, selected }: StoryNodeProps) {
  return (
    <div className="story-node" data-selected={selected}>
      <Handle type="target" position={Position.Left} isConnectable />
      <h4>{label}</h4>
      {data?.description && <p>{String(data.description)}</p>}
      {data?.promptRef && (
        <p className="prompt-ref">{String(data.promptRef)}</p>
      )}
      <Handle type="source" position={Position.Right} isConnectable />
    </div>
  );
}

function createNodeComponent(displayName: string) {
  return memo<NodeProps<NodeData>>((props) => (<BaseNode {...props} label={displayName} />));
}

const labels: Record<StoryEditorNodeType | "default", string> = {
  "topic-classifier": "Topic Classifier",
  "opening-story-prompt": "Opening Prompt",
  "theme-recommender": "Theme Recommender",
  "design-trigger": "Design Trigger",
  "entity-naming-prompt": "Entity Naming",
  "character-detail-prompt": "Character Detail",
  "setting-detail-prompt": "Setting Detail",
  "design-completion-handler": "Design Completion",
  "learner-turn-recorder": "Learner Turn Recorder",
  "feedback-coach": "Feedback Coach",
  "narrative-assessment": "Narrative Assessment",
  "conflict-guidance": "Conflict Guidance",
  "continuation-prompt": "Continuation Prompt",
  "story-state-updater": "Story State Updater",
  "ending-evaluator": "Ending Evaluator",
  "finale-prompt": "Finale Prompt",
  "restart-invitation": "Restart Invitation",
  "session-reset": "Session Reset",
  "vocabulary-intro": "Vocabulary Intro",
  "vocabulary-question-prompt": "Vocabulary Question",
  "vocabulary-completion": "Vocabulary Completion",
  "session-manager": "Session Manager",
  "telemetry-logger": "Telemetry Logger",
  "vocabulary-tracker": "Vocabulary Tracker",
  "response-assembler": "Response Assembler",
  default: "Story Node",
};

const nodeTypes = Object.fromEntries(
  (Object.keys(labels) as Array<StoryEditorNodeType | "default">)
    .filter((key) => key !== "default")
    .map((key) => [key, createNodeComponent(labels[key])])
) as Record<string, ReturnType<typeof createNodeComponent>>;

export { nodeTypes };
