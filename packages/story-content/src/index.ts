import storyPrompts from "../data/story-prompts.json";
import botResponses from "../data/bot-responses.json";
import topicConfig from "../data/topics.json";
import vocabularyPrompts from "../data/vocabulary-prompts.json";

interface TemplateDefinition {
  prompt_template: string;
  variables: string[];
}

type StoryPromptKey = keyof typeof storyPrompts;

function applyTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function sanitizeInput(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function buildStoryOpening(topic: string): string {
  const prompt = storyPrompts.story_opening as TemplateDefinition;
  return applyTemplate(prompt.prompt_template, { topic: sanitizeInput(topic) });
}

export function buildStoryContinuation(topic: string, context: string): string {
  const prompt = storyPrompts.story_continuation as TemplateDefinition;
  return applyTemplate(prompt.prompt_template, {
    topic: sanitizeInput(topic),
    context: sanitizeInput(context),
  });
}

export function buildStoryFinale(topic: string, resolutionIdea: string): string {
  const prompt = storyPrompts.story_finale as TemplateDefinition;
  return applyTemplate(prompt.prompt_template, {
    topic: sanitizeInput(topic),
    resolution: sanitizeInput(resolutionIdea) || "our heroes share what they learned",
  });
}

export function getBotResponse(key: string): string | undefined {
  const parts = key.split(".");
  let current: any = botResponses;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function detectTopicFromMessage(message: string): string {
  const normalized = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(topicConfig.topic_keywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return topic;
    }
  }
  const fallback = normalized.split(/\s+/)[0];
  return fallback || "adventure";
}

export function getThemeForTopic(topic?: string): string {
  if (!topic) {
    return topicConfig.default_theme;
  }
  return (
    topicConfig.theme_mapping[topic.toLowerCase()] ?? topicConfig.default_theme
  );
}

export function getVocabularyQuestionPrompt(
  word: string,
  sentenceContext: string,
): string {
  const template = vocabularyPrompts.question_generation as TemplateDefinition;
  return applyTemplate(template.prompt_template, {
    word: sanitizeInput(word),
    sentence_context: sanitizeInput(sentenceContext),
  });
}

export function getGrammarFeedbackPrompt(userText: string): string {
  const template = vocabularyPrompts.grammar_feedback as TemplateDefinition;
  return applyTemplate(template.prompt_template, {
    user_text: sanitizeInput(userText),
  });
}

export type { StoryPromptKey };
