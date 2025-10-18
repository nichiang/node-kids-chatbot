/*
 * Quick smoke test for the TypeScript StoryEngine.
 * Requires OPENAI_API_KEY in the workspace root .env file if you want real responses.
 */
import { StoryEngine } from "../src/index";
import { createInitialSessionState } from "@kids-chatbot/story-types";

async function main(): Promise<void> {
  const engine = new StoryEngine();
  let sessionState = createInitialSessionState();

  console.log("▶️  Running story engine smoke test\n");

  const openingTurn = await engine.runTurn(
    "Let's write a space story!",
    sessionState,
  );
  console.log("Opening response:\n", openingTurn.responseText, "\n");
  console.log("LLM timing:", openingTurn.session.storyParts.length, "turns so far");

  sessionState = openingTurn.session;
  const continuationTurn = await engine.runTurn(
    "The astronaut meets a glowing robot friend.",
    sessionState,
  );
  console.log("Continuation response:\n", continuationTurn.responseText, "\n");
  console.log("LLM timing:", continuationTurn.session.storyParts.length, "turns so far");

  sessionState = continuationTurn.session;
  const finaleTurn = await engine.runTurn(
    "They celebrate their friendship on the moon.",
    sessionState,
  );
  console.log("Finale response:\n", finaleTurn.responseText, "\n");
  console.log("LLM timing:", finaleTurn.session.storyParts.length, "turns total");

  console.log("✅ Smoke test complete. Session isComplete:", finaleTurn.session.isComplete);
}

main().catch((err) => {
  console.error("❌ Smoke test failed", err);
  process.exit(1);
});
