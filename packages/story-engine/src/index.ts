import {
  StoryNode,
  StoryPhase,
  StorySessionState,
  NodeExecutionContext,
  StoryTurnOutput,
  createInitialSessionState,
} from "@kids-chatbot/story-types";
import {
  detectTopicFromMessage,
  buildStoryOpening,
  buildStoryContinuation,
  buildStoryFinale,
} from "@kids-chatbot/story-content";
import {
  manageSessionLifecycle,
  cloneSessionState,
} from "./session";
import {
  TelemetryEvent,
  TelemetryLogger,
  createNoopTelemetryLogger,
} from "./telemetry";

interface StoryEngineOptions {
  telemetryLogger?: TelemetryLogger;
}

const topicClassifierNode: StoryNode = {
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

const storyOpeningNode: StoryNode = {
  id: "story-opening",
  phase: StoryPhase.Topic,
  execute(context: NodeExecutionContext) {
    const { session } = context;
    if (!session.topic) {
      throw new Error("Cannot build opening without a topic");
    }
    const openingText = buildStoryOpening(session.topic);
    const updatedSession: StorySessionState = {
      ...session,
      phase: StoryPhase.Writing,
      storyParts: [...session.storyParts, openingText],
      turn: session.turn + 1,
    };
    return {
      session: updatedSession,
      responseText: openingText,
    };
  },
};

const storyContinuationNode: StoryNode = {
  id: "story-continuation",
  phase: StoryPhase.Writing,
  execute(context: NodeExecutionContext) {
    const { session, userInput } = context;
    if (!session.topic) {
      throw new Error("Cannot continue story without a topic");
    }
    const continuation = buildStoryContinuation(session.topic, userInput);
    const updatedSession: StorySessionState = {
      ...session,
      storyParts: [...session.storyParts, continuation],
      turn: session.turn + 1,
    };

    return {
      session: updatedSession,
      responseText: continuation,
    };
  },
};

const storyCompletionNode: StoryNode = {
  id: "story-completion",
  phase: StoryPhase.Writing,
  execute(context: NodeExecutionContext) {
    const { session, userInput } = context;
    if (!session.topic) {
      throw new Error("Cannot complete story without a topic");
    }
    const finale = buildStoryFinale(session.topic, userInput);
    const updatedSession: StorySessionState = {
      ...session,
      storyParts: [...session.storyParts, finale],
      turn: session.turn + 1,
      phase: StoryPhase.Completed,
      isComplete: true,
    };

    return {
      session: updatedSession,
      responseText: finale,
    };
  },
};

export class StoryEngine {
  private telemetry: TelemetryLogger;

  constructor(options: StoryEngineOptions = {}) {
    this.telemetry = options.telemetryLogger ?? createNoopTelemetryLogger();
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
    const topicResult = await topicClassifierNode.execute(context);
    const openingResult = await storyOpeningNode.execute({
      session: topicResult.session,
      userInput: context.userInput,
    });

    this.telemetry.log(createTelemetryEvent("story_opening", openingResult));

    return {
      responseText: openingResult.responseText ?? "",
      session: openingResult.session,
    };
  }

  private async handleWritingPhase(
    context: NodeExecutionContext,
  ): Promise<StoryTurnOutput> {
    const { session } = context;

    if (session.isComplete) {
      return this.respondStoryCompleted(session);
    }

    if (session.storyParts.length === 1) {
      const continuationResult = await storyContinuationNode.execute(context);
      this.telemetry.log(createTelemetryEvent("story_continuation", continuationResult));
      return {
        responseText: continuationResult.responseText ?? "",
        session: continuationResult.session,
      };
    }

    if (session.storyParts.length === 2) {
      const completionResult = await storyCompletionNode.execute(context);
      this.telemetry.log(createTelemetryEvent("story_completion", completionResult));
      return {
        responseText: completionResult.responseText ?? "",
        session: completionResult.session,
      };
    }

    return this.respondStoryCompleted(session);
  }

  private respondStoryCompleted(
    session: StorySessionState,
  ): StoryTurnOutput {
    return {
      responseText:
        "Our story is already complete! Let's start a new adventure next time.",
      session,
    };
  }
}

export const nodes = {
  topicClassifierNode,
  storyOpeningNode,
  storyContinuationNode,
  storyCompletionNode,
};

function createTelemetryEvent(
  eventType: TelemetryEvent["type"],
  result: { session: StorySessionState; responseText?: string },
): TelemetryEvent {
  return {
    type: eventType,
    sessionId: result.session.sessionId ?? "unknown",
    storyId: result.session.currentStoryId,
    timestamp: new Date(),
    payload: {
      responseText: result.responseText,
      storyLength: result.session.storyParts.length,
      phase: result.session.phase,
    },
  };
}

export * from "./session";
export * from "./telemetry";
