# End-to-End LLM Integration Plan

## 1. Content & Schema Completion
- Migrate remaining story assets: design prompts, conflict guidance, vocabulary fallbacks, fun-facts.
- Define JSON Schemas for prompts/strings/config; add validation step to build/test pipelines.
- Extend `@kids-chatbot/story-content` with typed accessors covering all migrated assets.

## 2. Story Engine Expansion
- Swap placeholder template builders for real prompt assembly (opening JSON format, continuation context windows, finale weaving).
- Add response parsers to validate LLM JSON output and capture entities/vocabulary with fallback logic.
- Implement nodes for design phase, vocabulary quiz flow, and completion handling; ensure session lifecycle/telemetry are wired for each.

## 3. LLM Provider Integration
- Create configurable LLM client (OpenAI, Anthropic, etc.) with retry, timeout, and error surfacing.
- Connect engine nodes to the provider, passing system/user prompts and receiving structured responses.
- Emit latency and call metadata through the telemetry logger for analytics.

## 4. API Surface & Session Persistence
- Flesh out `apps/story-api` with Fastify/Nest controllers exposing `POST /chat` (and health/tooling endpoints).
- Persist session state across turns via in-memory cache or external store; normalize request/response schemas with Zod/TypeBox.
- Route telemetry/events to logging stack (stdout, Datadog, etc.) and add error handling middleware.

## 5. Frontend & Editor Integration
- Hook the chat UI (existing frontend or new client) to the Node API for live conversations.
- Upgrade the React Flow editor to load/save real graphs, edit prompt references, and trigger sandbox simulations via the API.
- Provide import/export tooling so editor changes can be committed back into content packages.

## 6. Tooling, Testing, and Documentation
- Expand automated tests: mock LLM responses, cover parser fallbacks, add contract tests between engine and API.
- Set up linting/formatting and CI pipelines running `test`, `typecheck`, and content validation.
- Document environment setup (`.env`, migration scripts, npm workflows) and create runbooks for future iterations.

---

These steps deliver a fully functional, LLM-backed story experience with validated content, session management, telemetry, and authoring tools.
