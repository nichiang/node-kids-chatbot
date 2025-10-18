import { StorySessionState, createInitialSessionState } from "@kids-chatbot/story-types";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export class SessionStore {
  private store = new Map<string, { state: StorySessionState; updatedAt: number }>();

  get(sessionId?: string): StorySessionState | undefined {
    if (!sessionId) {
      return undefined;
    }
    const entry = this.store.get(sessionId);
    return entry?.state;
  }

  save(state: StorySessionState): void {
    if (!state.sessionId) {
      return;
    }
    this.store.set(state.sessionId, {
      state,
      updatedAt: Date.now(),
    });
  }

  createNew(): StorySessionState {
    return createInitialSessionState();
  }

  prune(ttlMs: number = THIRTY_MINUTES_MS): void {
    const cutoff = Date.now() - ttlMs;
    for (const [sessionId, entry] of this.store.entries()) {
      if (entry.updatedAt < cutoff) {
        this.store.delete(sessionId);
      }
    }
  }
}
