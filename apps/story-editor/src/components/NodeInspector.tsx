import { useMemo } from "react";
import { useStoryGraph } from "../state/use-story-graph";
import { useSelection } from "../state/use-selection";
import { FieldGroup } from "./FieldGroup";
import {
  listStoryPromptKeys,
  listVocabularyPromptKeys,
  getStoryPrompt,
  getVocabularyPrompt,
} from "@kids-chatbot/story-content";
import type { StoryGraphNode } from "../graphs/node-types";

const STORY_PROMPT_TYPES = new Set([
  "opening-story-prompt",
  "continuation-prompt",
  "finale-prompt",
]);

const VOCAB_PROMPT_TYPES = new Set([
  "vocabulary-intro",
  "vocabulary-question-prompt",
  "vocabulary-completion",
]);

export function NodeInspector() {
  const graph = useStoryGraph((state) => state.graph);
  const setGraph = useStoryGraph((state) => state.setGraph);
  const selectedNodeId = useSelection((state) => state.selectedNodeId);

  const storyPromptOptions = useMemo(() => listStoryPromptKeys(), []);
  const vocabPromptOptions = useMemo(() => listVocabularyPromptKeys(), []);

  const node = useMemo<StoryGraphNode | undefined>(
    () => graph.nodes.find((n) => n.id === selectedNodeId),
    [graph.nodes, selectedNodeId],
  );

  const promptText = useMemo(() => {
    const ref = node?.data?.promptRef as string | undefined;
    if (!ref) {
      return undefined;
    }
    if (ref.startsWith("story_prompts.")) {
      const key = ref.replace("story_prompts.", "");
      return getStoryPrompt(key)?.prompt_template;
    }
    if (ref.startsWith("vocabulary_prompts.")) {
      const key = ref.replace("vocabulary_prompts.", "");
      return getVocabularyPrompt(key)?.prompt_template;
    }
    return undefined;
  }, [node?.data?.promptRef]);

  if (!node) {
    return (
      <section className="node-inspector">
        <h2>Inspector</h2>
        <p>Select a node to edit its properties.</p>
      </section>
    );
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const updatedNode: StoryGraphNode = {
      ...node,
      data: {
        ...node.data,
        [name]: value,
      },
    };

    setGraph({
      ...graph,
      nodes: graph.nodes.map((n) => (n.id === node.id ? updatedNode : n)),
    });
  };

  return (
    <section className="node-inspector">
      <h2>Inspector</h2>
      <FieldGroup label="Node ID">
        <input value={node.id} disabled />
      </FieldGroup>
      <FieldGroup label="Node Type">
        <input value={node.type} disabled />
      </FieldGroup>
      <FieldGroup label="Description">
        <textarea
          name="description"
          value={(node.data?.description as string) ?? ""}
          onChange={handleChange}
          rows={3}
        />
      </FieldGroup>

      {STORY_PROMPT_TYPES.has(node.type as string) && (
        <FieldGroup
          label="Story Prompt"
          helpText="Choose a prompt from story-content to drive this node."
        >
          <select
            name="promptRef"
            value={(node.data?.promptRef as string) ?? ""}
            onChange={handleChange}
          >
            <option value="">(select prompt)</option>
            {storyPromptOptions.map((option) => (
              <option key={option.id} value={`story_prompts.${option.id}`}>
                {option.id}
              </option>
            ))}
          </select>
        </FieldGroup>
      )}

      {VOCAB_PROMPT_TYPES.has(node.type as string) && (
        <FieldGroup label="Vocabulary Prompt">
          <select
            name="promptRef"
            value={(node.data?.promptRef as string) ?? ""}
            onChange={handleChange}
          >
            <option value="">(select prompt)</option>
            {vocabPromptOptions.map((option) => (
              <option key={option.id} value={`vocabulary_prompts.${option.id}`}>
                {option.id}
              </option>
            ))}
          </select>
        </FieldGroup>
      )}

      {!STORY_PROMPT_TYPES.has(node.type as string) &&
        !VOCAB_PROMPT_TYPES.has(node.type as string) && (
          <FieldGroup label="Prompt Ref">
            <input
              name="promptRef"
              value={(node.data?.promptRef as string) ?? ""}
              onChange={handleChange}
            />
          </FieldGroup>
        )}

      {promptText && (
        <FieldGroup label="Prompt Template">
          <pre className="prompt-preview">{promptText}</pre>
        </FieldGroup>
      )}
    </section>
  );
}
