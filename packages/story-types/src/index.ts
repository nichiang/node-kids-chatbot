export type StorySessionMode = "storywriting";

export enum StoryPhase {
  Topic = "topic",
  Writing = "writing",
  Completed = "completed",
}

export interface StorySessionState {
  phase: StoryPhase;
  topic?: string;
  storyParts: string[];
  turn: number;
  isComplete: boolean;
  sessionId?: string;
  sessionStart?: Date;
  lastActivity?: Date;
  turnId: number;
  currentStoryId?: string;
  storyHistory: string[];
}

export interface NodeExecutionContext {
  session: StorySessionState;
  userInput: string;
}

export interface NodeResult {
  session: StorySessionState;
  responseText?: string;
  metadata?: Record<string, unknown>;
}

export interface StoryNode {
  id: string;
  phase: StoryPhase;
  execute(context: NodeExecutionContext): Promise<NodeResult> | NodeResult;
}

export interface StoryTurnOutput {
  responseText: string;
  session: StorySessionState;
}

export function createInitialSessionState(): StorySessionState {
  return {
    phase: StoryPhase.Topic,
    topic: undefined,
    storyParts: [],
    turn: 0,
    isComplete: false,
    turnId: 0,
    storyHistory: [],
  };
}
