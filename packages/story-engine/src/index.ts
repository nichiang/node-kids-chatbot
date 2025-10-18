import {
  StoryPhase,
  StorySessionState,
  NodeExecutionContext,
  StoryTurnOutput,
  createInitialSessionState,
} from "@kids-chatbot/story-types";
import {
  detectTopicFromMessage,
  renderStoryOpening,
  renderStoryContinuation,
  renderStoryFinale,
} from "@kids-chatbot/story-content";
import { manageSessionLifecycle, cloneSessionState } from "./session";
import {
  TelemetryEvent,
  TelemetryLogger,
  createNoopTelemetryLogger,
} from "./telemetry";
import {
  LLMClient,
  LLMProvider,
  LLMCallTiming,
} from "./llm";

interface StoryEngineOptions {
  telemetryLogger?: TelemetryLogger;
  llmProvider?: LLMClient;
}

const topicClassifierNode = {
  id: "topic-classifier",
  phase: StoryPhase.Topic,
  execute(context: NodeExecutionContext) {
    if (context.session.topic) {
      return { session: context.session };
    }
    const topic = detectTopicFromMessage(context.userInput);
    return {
      session: {
        ...context.session,
        topic,
      },
    };
  },
};

export class StoryEngine {
  private telemetry: TelemetryLogger;
  private llm: LLMClient;

  constructor(options: StoryEngineOptions = {}) {
    this.telemetry = options.telemetryLogger ?? createNoopTelemetryLogger();
    this.llm = options.llmProvider ?? new LLMProvider();
  }

  async runTurn(
    userInput: string,
    sessionState?: StorySessionState,
  ): Promise<StoryTurnOutput> {
    const baseSession = sessionState
      ? cloneSessionState(sessionState)
      : createInitialSessionState();

    const lifecycleManaged = manageSessionLifecycle(
      baseSession,
      new Date(),
      "storywriting",
    );

    const context: NodeExecutionContext = {
      session: lifecycleManaged,
      userInput,
    };

    switch (lifecycleManaged.phase) {
      case StoryPhase.Topic:
        return this.handleTopicPhase(context);
      case StoryPhase.Writing:
        return this.handleWritingPhase(context);
      case StoryPhase.Completed:
        return this.respondStoryCompleted(lifecycleManaged);
      default:
        return this.handleTopicPhase(context);
    }
  }

  private async handleTopicPhase(
    context: NodeExecutionContext,
  ): Promise<StoryTurnOutput> {
    const topicResult = topicClassifierNode.execute(context);
    const topicSession = topicResult.session;
    if (!topicSession.topic) {
      throw new Error("Topic detection failed");
    }

    const promptText = renderStoryOpening(topicSession.topic);
    const systemPrompt = await this.llm.getStorySystemPrompt();
    const llmResult = await this.llm.generateStoryResponse({
      prompt: promptText,
      systemPrompt,
    });

    const updatedSession: StorySessionState = {
      ...topicSession,
      phase: StoryPhase.Writing,
      storyParts: [...topicSession.storyParts, llmResult.text],
      turn: topicSession.turn + 1,
    };

    this.telemetry.log(
      createTelemetryEvent(
        "story_opening",
        updatedSession,
        llmResult.text,
        llmResult.timing,
      ),
    );

    return {
      responseText: llmResult.text,
      session: updatedSession,
    };
  }

  private async handleWritingPhase(
    context: NodeExecutionContext,
  ): Promise<StoryTurnOutput> {
    const { session, userInput } = context;

    if (!session.topic) {
      throw new Error("Cannot continue story without a topic");
    }

    if (session.isComplete) {
      return this.respondStoryCompleted(session);
    }

    if (session.storyParts.length === 1) {
      const promptText = renderStoryContinuation(
        session.topic,
        session.storyParts.slice(-3).join(" "),
      );
      const llmResult = await this.llm.generateStoryResponse({
        prompt: promptText,
        systemPrompt: await this.llm.getStorySystemPrompt(),
      });

      const updatedSession: StorySessionState = {
        ...session,
        storyParts: [...session.storyParts, llmResult.text],
        turn: session.turn + 1,
      };

      this.telemetry.log(
        createTelemetryEvent(
          "story_continuation",
          updatedSession,
          llmResult.text,
          llmResult.timing,
        ),
      );

      return {
        responseText: llmResult.text,
        session: updatedSession,
      };
    }

    const promptText = renderStoryFinale(session.topic, userInput);
    const llmResult = await this.llm.generateStoryResponse({
      prompt: promptText,
      systemPrompt: await this.llm.getStorySystemPrompt(),
    });

    const updatedSession: StorySessionState = {
      ...session,
      storyParts: [...session.storyParts, llmResult.text],
      turn: session.turn + 1,
      phase: StoryPhase.Completed,
      isComplete: true,
    };

    this.telemetry.log(
      createTelemetryEvent(
        "story_completion",
        updatedSession,
        llmResult.text,
        llmResult.timing,
      ),
    );

    return {
      responseText: llmResult.text,
      session: updatedSession,
    };
  }

  private respondStoryCompleted(
    session: StorySessionState,
  ): StoryTurnOutput {
    this.telemetry.log(
      createTelemetryEvent(
        "story_completed",
        session,
        "Our story is already complete! Let's start a new adventure next time.",
        { type: "story_completed", durationMs: 0 },
      ),
    );

    return {
      responseText:
        "Our story is already complete! Let's start a new adventure next time.",
      session,
    };
  }
}

export const nodes = {
  topicClassifierNode,
};

function createTelemetryEvent(
  eventType: TelemetryEvent["type"],
  session: StorySessionState,
  responseText: string,
  timing: LLMCallTiming,
): TelemetryEvent {
  return {
    type: eventType,
    sessionId: session.sessionId ?? "unknown",
    storyId: session.currentStoryId,
    timestamp: new Date(),
    payload: {
      responseText,
      storyLength: session.storyParts.length,
      phase: session.phase,
      llm_duration_ms: timing.durationMs,
      ...(timing.error ? { llm_error: timing.error } : {}),
    },
  };
}
