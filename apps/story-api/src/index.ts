import Fastify from "fastify";
import cors from "@fastify/cors";
import { StoryEngine } from "@kids-chatbot/story-engine";
import { createInitialSessionState } from "@kids-chatbot/story-types";

async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, { origin: true });

  const engine = new StoryEngine();

  fastify.get("/health", async () => ({ status: "ok", message: "Story API running" }));

  fastify.post("/chat", async (request, reply) => {
    const body: any = request.body ?? {};
    const message: string = body.message ?? "";
    const sessionData = body.sessionData ?? createInitialSessionState();

    try {
      const result = await engine.runTurn(message, sessionData);
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

export { buildServer };
