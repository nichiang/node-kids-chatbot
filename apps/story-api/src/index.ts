import { StoryEngine } from "@kids-chatbot/story-engine";
import { createInitialSessionState } from "@kids-chatbot/story-types";

async function bootstrap() {
  const engine = new StoryEngine();
  let session = createInitialSessionState();

  const opening = await engine.runTurn("Let's write a space story!", session);
  console.log("Opening response:\n", opening.responseText);

  session = opening.session;
  const continuation = await engine.runTurn(
    "Our heroes find a friendly robot.",
    session,
  );
  console.log("Continuation response:\n", continuation.responseText);

  session = continuation.session;
  const finale = await engine.runTurn(
    "They share what they learned with everyone.",
    session,
  );
  console.log("Finale response:\n", finale.responseText);
}

bootstrap().catch((err) => {
  console.error("Failed to run story API scaffold", err);
});
