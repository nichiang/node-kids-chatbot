# Story API Plan

## Goals
- Expose the TypeScript story engine through an HTTP API that mirrors the existing Python FastAPI interface (`POST /chat`).
- Maintain session state between requests, enabling multi-turn conversations.
- Surface telemetry and error handling consistent with the legacy service.

## API Surface
- `POST /chat`
  - Request body: `{ message: string, mode?: "storywriting" | "funfacts", sessionData?: object }`
  - Response: story engine output `{ response: string, sessionData: object, ... }`
- `GET /health`
  - Health check endpoint

## Session Persistence
- Use in-memory Map keyed by sessionId for the initial implementation.
- Each entry stores the latest `StorySessionState` and timestamp for cleanup.
- Future enhancement: extract to Redis/database.

## Implementation Steps
1. Set up Fastify app in `apps/story-api`:
   - Register JSON parsing, CORS if needed.
   - Add `/health` and `/chat` routes.
2. Session management:
   - Middleware/helper to load session from store or create new `createInitialSessionState()`.
   - After each turn, update store with returned session state.
3. Telemetry/logging:
   - Log request details, response summaries, and LLM timings (already emitted in engine telemetry events).
   - Hook TelemetryLogger to emit to console for now.
4. Error handling:
   - Wrap engine calls in try/catch, return error payload with HTTP 500 when needed.
5. CLI client:
   - Build simple Node CLI (or reuse existing script) to post user messages to `/chat` and print replies.

## Todo
- [ ] Scaffold Fastify server with `/chat` and `/health` routes.
- [ ] Implement in-memory session store.
- [ ] Wire session store + engine + telemetry logger.
- [ ] Create CLI script to interact with the API.
- [ ] Add basic integration tests (optional).
