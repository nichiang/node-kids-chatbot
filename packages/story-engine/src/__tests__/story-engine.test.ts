import { describe, it, expect } from "vitest";
import { StoryEngine } from "@kids-chatbot/story-engine";
import {
  StoryPhase,
  createInitialSessionState,
} from "@kids-chatbot/story-types";

describe("StoryEngine", () => {
  it("walks through topic → continuation → completion with lifecycle and telemetry hooks", async () => {
    const engine = new StoryEngine();
    let session = createInitialSessionState();

    const openingTurn = await engine.runTurn(
      "Can we tell a space story?",
      session,
    );

    expect(openingTurn.session.sessionId).toBeDefined();
    expect(openingTurn.session.currentStoryId).toBeDefined();
    expect(openingTurn.session.storyHistory).toHaveLength(1);
    expect(openingTurn.session.turnId).toBe(1);
    expect(openingTurn.responseText).toContain("space");
    expect(openingTurn.session.phase).toBe(StoryPhase.Writing);
    expect(openingTurn.session.storyParts).toHaveLength(1);

    session = openingTurn.session;
    const continuationTurn = await engine.runTurn(
      "The astronaut meets a glowing robot friend.",
      session,
    );

    expect(continuationTurn.session.turnId).toBe(2);
    expect(continuationTurn.responseText).toContain("glowing robot friend");
    expect(continuationTurn.session.storyParts).toHaveLength(2);
    expect(continuationTurn.session.isComplete).toBe(false);

    session = continuationTurn.session;
    const finaleTurn = await engine.runTurn(
      "They celebrate their friendship on the moon.",
      session,
    );

    expect(finaleTurn.session.turnId).toBe(3);
    expect(finaleTurn.session.phase).toBe(StoryPhase.Completed);
    expect(finaleTurn.session.storyParts).toHaveLength(3);
    expect(finaleTurn.session.isComplete).toBe(true);
    expect(finaleTurn.responseText).toContain("The end");
  });
});
