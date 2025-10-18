export interface SessionIdentifiers {
  sessionId: string;
  storyId?: string;
  turnId: number;
}

export interface StoryNodeContext {
  session: SessionIdentifiers;
  topic?: string;
}

// TODO: populate with real schemas mirrored from the Python models.
