import type { StoryNodeContext } from "@kids-chatbot/story-types";

export interface PromptAsset {
  id: string;
  description: string;
  template: string;
}

export function loadPromptAsset(id: string): PromptAsset {
  // Placeholder implementation; will be replaced with real content loading logic.
  return {
    id,
    description: "TODO: wire real prompt metadata",
    template: "",
  };
}

export function getThemeForTopic(context: StoryNodeContext): string {
  if (!context.topic) {
    return "theme-default";
  }
  return `theme-${context.topic.toLowerCase()}`;
}
