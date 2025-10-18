import { runStoryOpening } from "@kids-chatbot/story-engine";

async function bootstrap() {
  const result = await runStoryOpening({
    session: { sessionId: "dev", turnId: 1 },
    topic: "adventure",
  });

  console.log("Story engine placeholder response", result);
}

bootstrap().catch((err) => {
  console.error("Failed to start story API scaffold", err);
});
