import { config as loadEnv } from "dotenv";
import OpenAI from "openai";
import { performance } from "perf_hooks";

loadEnv();

export interface LLMCallTiming {
  type: string;
  durationMs: number;
  error?: string;
}

export interface GenerateStoryParams {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StoryLLMResult {
  text: string;
  timing: LLMCallTiming;
}

export interface LLMClient {
  getStorySystemPrompt(): Promise<string>;
  generateStoryResponse(params: GenerateStoryParams): Promise<StoryLLMResult>;
}

const DEFAULT_STORY_SYSTEM_PROMPT = `You are a friendly English tutor for elementary school students. Work with the child to create imaginative stories, encourage their ideas, and keep sentences short, clear, and positive.`;

export class LLMProvider implements LLMClient {
  private apiKey?: string;
  private model: string;
  private baseUrl: string;
  private client: OpenAI | null;
  private storySystemPrompt: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    this.storySystemPrompt = DEFAULT_STORY_SYSTEM_PROMPT;

    this.client = this.apiKey
      ? new OpenAI({ apiKey: this.apiKey, baseURL: this.baseUrl })
      : null;
  }

  async getStorySystemPrompt(): Promise<string> {
    return this.storySystemPrompt;
  }

  async generateStoryResponse(
    params: GenerateStoryParams,
  ): Promise<StoryLLMResult> {
    const { prompt, systemPrompt, maxTokens = 300, temperature = 0.7 } = params;
    const started = performance.now();
    let error: string | undefined;
    let text = "";

    if (this.client) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt ?? this.storySystemPrompt,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
        });

        text = response.choices[0]?.message?.content?.trim() ?? "";
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
    }

    if (!text) {
      text = this.fallbackStoryResponse(prompt);
    }

    const timing = this.createTiming(
      "story_generation",
      performance.now() - started,
      error,
    );

    return {
      text,
      timing,
    };
  }

  private createTiming(
    type: string,
    durationMs: number,
    error?: string,
  ): LLMCallTiming {
    return {
      type,
      durationMs: Math.round(durationMs * 100) / 100,
      ...(error ? { error } : {}),
    };
  }

  private fallbackStoryResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes("space")) {
      return "🚀 Space adventures are incredible! Captain Zoe blasts off toward a mysterious planet filled with shimmering lights. What should happen next in this cosmic mission?";
    }

    if (promptLower.includes("dragon") || promptLower.includes("magic")) {
      return "🏰 A curious wizard cracks open a glowing book and finds a friendly dragon waiting to help. How will their magical adventure begin?";
    }

    return "Let's kick off our story with a burst of imagination! Tell me what our hero should do first.";
  }
}
