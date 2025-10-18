export interface TelemetryEvent {
  type: "story_opening" | "story_continuation" | "story_completion" | "story_completed";
  sessionId: string;
  storyId?: string;
  timestamp: Date;
  payload?: Record<string, unknown>;
}

export interface TelemetryLogger {
  log(event: TelemetryEvent): void | Promise<void>;
}

export function createNoopTelemetryLogger(): TelemetryLogger {
  return {
    log() {
      // intentionally blank
    },
  };
}
