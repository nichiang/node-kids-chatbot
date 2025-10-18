import { randomUUID } from "crypto";
import {
  StorySessionState,
  StorySessionMode,
  StoryPhase,
} from "@kids-chatbot/story-types";

const SESSION_TIMEOUT_MINUTES = 30;

export function manageSessionLifecycle(
  session: StorySessionState,
  now: Date,
  mode: StorySessionMode = "storywriting",
): StorySessionState {
  const cloned = cloneSessionState(session);
  const inactiveMinutes = cloned.lastActivity
    ? (now.getTime() - cloned.lastActivity.getTime()) / 60000
    : null;

  if (!cloned.sessionId || inactiveMinutes === null) {
    initializeNewSession(cloned, now);
  } else if (inactiveMinutes > SESSION_TIMEOUT_MINUTES) {
    restartSession(cloned, now);
  } else {
    cloned.turnId += 1;
    cloned.lastActivity = now;
  }

  manageStoryIds(cloned, mode);
  return cloned;
}

function initializeNewSession(session: StorySessionState, now: Date) {
  session.sessionId = randomUUID();
  session.sessionStart = now;
  session.lastActivity = now;
  session.turnId = 1;
  session.storyHistory = [];
  session.currentStoryId = undefined;
  session.turn = 0;
  session.isComplete = false;
}

function restartSession(session: StorySessionState, now: Date) {
  session.sessionId = randomUUID();
  session.sessionStart = now;
  session.lastActivity = now;
  session.turnId = 1;
  session.currentStoryId = undefined;
  session.storyHistory = [];
  session.phase = StoryPhase.Topic;
  session.topic = undefined;
  session.storyParts = [];
  session.turn = 0;
  session.isComplete = false;
}

function manageStoryIds(
  session: StorySessionState,
  mode: StorySessionMode,
) {
  if (mode !== "storywriting") {
    return;
  }

  if (!session.currentStoryId) {
    session.currentStoryId = randomUUID();
    session.storyHistory.push(session.currentStoryId);
  }
}

export function cloneSessionState(session: StorySessionState): StorySessionState {
  return {
    ...session,
    storyParts: [...session.storyParts],
    storyHistory: session.storyHistory ? [...session.storyHistory] : [],
    sessionStart: session.sessionStart ? new Date(session.sessionStart) : undefined,
    lastActivity: session.lastActivity ? new Date(session.lastActivity) : undefined,
  };
}
