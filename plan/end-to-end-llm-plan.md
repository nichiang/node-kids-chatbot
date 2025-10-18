# End-to-End LLM Integration Plan

## 1. Content & Schema Completion
- Hardcode the essential prompts, bot responses, and topic metadata for the MVP while shaping APIs to swap in editor-managed content later (data stored under `packages/story-content/data/` with template + variable metadata).
- Outline JSON schema contracts even if validation is deferred; keep loader signatures compatible with future editable assets.
- Ensure `@kids-chatbot/story-content` exposes typed accessors that mirror what the node editor will need so content swapping stays seamless.

## 2. Story Engine Expansion
- Swap placeholder template builders for real prompt assembly (opening JSON format, continuation context windows, finale weaving).
- Add response parsers to validate LLM JSON output and capture entities/vocabulary with fallback logic.
- Implement nodes for design phase, vocabulary quiz flow, and completion handling; ensure session lifecycle/telemetry are wired for each.

## 3. LLM Provider Integration
- Mirror the existing Python `llm_provider` setup: load `.env` via `dotenv`, read `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_BASE_URL`, and initialize the OpenAI client with identical defaults.
- Port the timing decorator / metrics capture (`measure_llm_call`) so latency data feeds the TypeScript telemetry logger; preserve fallback responses for local/offline runs.
- Wire engine nodes to this provider with the same system prompts and request/response structure (chat completions), returning structured payloads for downstream parsers.

## 4. API Surface & Session Persistence
- Flesh out `apps/story-api` with Fastify/Nest controllers exposing `POST /chat` (and health/tooling endpoints).
- Persist session state across turns via in-memory cache or external store; normalize request/response schemas with Zod/TypeBox.
- Route telemetry/events to logging stack (stdout, Datadog, etc.) and add error handling middleware.

## 5. Frontend & Editor Integration
- Build a simple terminal-based client first (REPL or CLI) that posts to the story API and prints responses; use it to validate LLM flows before wiring HTML UI.
- Hook the existing HTML frontend to the Node API once the CLI path is stable, reusing assets from `/frontend`.
- Upgrade the React Flow editor to load/save real graphs, edit prompt references, and trigger sandbox simulations via the API.
- Provide import/export tooling so editor changes can be committed back into content packages.

## 6. Tooling, Testing, and Documentation
- Expand automated tests: mock LLM responses, cover parser fallbacks, add contract tests between engine and API.
- Document environment setup (`.env`, migration scripts, npm workflows) and create runbooks for future iterations. (Linting, formatting, and CI pipelines can land in a later phase.)

---

These steps deliver a fully functional, LLM-backed story experience with validated content, session management, telemetry, and authoring tools.

## Todo List
- [ ] Flesh out story prompts/content loaders to support editor edits.
- [ ] Port Python llm_provider configuration to TypeScript and connect engine nodes.
- [ ] Implement session persistence + REST API controllers in `apps/story-api`.
- [ ] Build CLI client for early end-to-end testing.
- [ ] Enhance React Flow editor with load/save + simulation hooks.
- [ ] Add automated tests covering LLM mocks and parser fallbacks.
- [ ] Document env setup and workflows for contributors.
