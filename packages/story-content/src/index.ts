const PROMPT_LIBRARY = {
  "story.opening": {
    id: "story.opening",
    description: "Opening paragraph template for the placeholder story engine",
    template:
      "Let's imagine a {topic} adventure! Our story begins with a burst of curiosity and a dash of courage.",
  },
  "story.continuation": {
    id: "story.continuation",
    description: "Continuation template that stitches in the learner's latest idea",
    template:
      "Building on the excitement, {userInput} inspires our heroes to explore even more of the {topic} world.",
  },
  "story.finale": {
    id: "story.finale",
    description: "Closing paragraph template that wraps up the adventure",
    template:
      "In the final moments, {resolution}, and the {topic} adventure ends on a joyful note. The end!",
  },
} as const;

const TOPIC_KEYWORDS: Record<string, string[]> = {
  space: ["space", "planet", "rocket", "astronaut", "galaxy"],
  animals: ["animal", "zoo", "creature", "lion", "dog", "cat"],
  fantasy: ["dragon", "wizard", "magic", "castle", "fairy"],
  ocean: ["ocean", "sea", "wave", "fish", "dolphin"],
  sports: ["sport", "soccer", "football", "basketball", "game"],
};

export interface PromptAsset {
  id: string;
  description: string;
  template: string;
}

export function loadPromptAsset(id: keyof typeof PROMPT_LIBRARY): PromptAsset {
  return PROMPT_LIBRARY[id];
}

export function detectTopicFromMessage(message: string): string {
  const normalized = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return topic;
    }
  }
  const firstWord = normalized.split(/\s+/)[0];
  return firstWord || "adventure";
}

export function getThemeForTopic(topic?: string): string {
  if (!topic) {
    return "theme-adventure";
  }
  return `theme-${topic.toLowerCase()}`;
}

export function buildStoryOpening(topic: string): string {
  const asset = loadPromptAsset("story.opening");
  return asset.template.replace("{topic}", topic);
}

export function buildStoryContinuation(
  topic: string,
  userInput: string,
): string {
  const asset = loadPromptAsset("story.continuation");
  return asset.template
    .replace("{topic}", topic)
    .replace("{userInput}", sanitizeUserInput(userInput));
}

export function buildStoryFinale(
  topic: string,
  resolutionIdea: string,
): string {
  const asset = loadPromptAsset("story.finale");
  const resolution = resolutionIdea.trim().length > 0
    ? sanitizeUserInput(resolutionIdea)
    : "our heroes share what they learned";
  return asset.template
    .replace("{topic}", topic)
    .replace("{resolution}", resolution);
}

function sanitizeUserInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
