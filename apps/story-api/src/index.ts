import Fastify from "fastify";
import cors from "@fastify/cors";
import { StoryEngine } from "@kids-chatbot/story-engine";
import {
  createInitialSessionState,
  StorySessionState,
  StoryPhase,
} from "@kids-chatbot/story-types";
import { SessionStore } from "./session-store";

async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, { origin: true });

  const telemetryLogger = {
    log(event: any) {
      fastify.log.info({ event }, "story_telemetry");
    },
  };

  const engine = new StoryEngine({ telemetryLogger });
  const sessionStore = new SessionStore();

  fastify.get("/health", async () => ({ status: "ok", message: "Story API running" }));

  fastify.post("/chat", async (request, reply) => {
    const body: any = request.body ?? {};
    const message: string = body.message ?? "";
    const mode: string = body.mode ?? "storywriting";
    const rawSession = body.sessionData ?? body.session;

    if (mode !== "storywriting") {
      reply.code(400);
      return { error: "unsupported_mode" };
    }

    const normalizedSession = coerceSessionState(rawSession);
    const existingSession = normalizedSession?.sessionId
      ? sessionStore.get(normalizedSession.sessionId)
      : undefined;
    const sessionState = existingSession ?? normalizedSession ?? sessionStore.createNew();

    try {
      const result = await engine.runTurn(message, sessionState);
      sessionStore.save(result.session);
      sessionStore.prune();

      return {
        response: result.responseText,
        sessionData: result.session,
      };
    } catch (error) {
      request.log.error({ err: error }, "Story engine error");
      reply.code(500);
      return { error: "story_engine_error" };
    }
  });

  return fastify;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildServer()
    .then((server) => server.listen({ port: 3000, host: "0.0.0.0" }))
    .catch((err) => {
      console.error("Failed to start server", err);
      process.exit(1);
    });
}

function coerceSessionState(raw: any): StorySessionState | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const sessionId = raw.sessionId ?? raw.session_id ?? undefined;
  const sessionStart = raw.sessionStart ?? raw.session_start ?? undefined;
  const lastActivity = raw.lastActivity ?? raw.last_activity ?? undefined;
  const turnId = raw.turnId ?? raw.turn_id ?? 0;
  const storyHistory = raw.storyHistory ?? raw.story_history ?? [];

  return {
    phase: (raw.phase as StoryPhase) ?? raw.conversationPhase ?? StoryPhase.Topic,
    topic: raw.topic ?? undefined,
    storyParts: Array.isArray(raw.storyParts) ? raw.storyParts : [],
    turn: raw.turn ?? 0,
    isComplete: raw.isComplete ?? false,
    sessionId,
    sessionStart: sessionStart ? new Date(sessionStart) : undefined,
    lastActivity: lastActivity ? new Date(lastActivity) : undefined,
    turnId,
    currentStoryId: raw.currentStoryId ?? raw.current_story_id ?? undefined,
    storyHistory: Array.isArray(storyHistory) ? storyHistory : [],
  };
}

export { buildServer };
