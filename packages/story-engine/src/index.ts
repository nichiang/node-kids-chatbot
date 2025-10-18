import type { StoryNodeContext } from "@kids-chatbot/story-types";
import { loadPromptAsset } from "@kids-chatbot/story-content";

export interface EngineResult {
  response: string;
  nextPhase: string;
}

export async function runStoryOpening(context: StoryNodeContext): Promise<EngineResult> {
  const prompt = loadPromptAsset("story.opening");
  return {
    response: prompt.template || "[story opening pending implementation]",
    nextPhase: "design-check",
  };
}

// Future: register node handlers and expose execution graph utilities here.
