# Story Engine Prototype Scope

## Goals
- Provide a runnable TypeScript graph runner that handles the story path from topic detection through story completion with deterministic placeholder logic (no LLM calls yet).
- Establish shared types for session state, node execution context, and story phase transitions so future work can plug in richer handlers.
- Demonstrate how user inputs flow through Topic → Opening → Continuation → Completion using a small set of node handlers.

## Prototype Boundaries
- Single conversation mode (`storywriting`); fun-facts and vocabulary quiz flows remain out of scope (stubs only).
- Deterministic prompt outputs sourced from `@kids-chatbot/story-content` placeholder assets.
- In-memory session state only; no persistence, telemetry emission, or content loading from disk yet.
- Simple end-of-story heuristic: mark complete after two continuation turns beyond the opening.

## Key Contracts
- `StoryPhase` enum capturing `Topic`, `Writing`, and `Completed` phases.
- `StorySessionState` interface with minimal fields (`phase`, `topic`, `storyParts`, `turn`, `isComplete`).
- `NodeExecutionContext` struct bundling session state, latest user message, and shared content adapters.
- `StoryNode` definition with `id`, `phase`, and `execute(context)` signature returning a `NodeResult` containing updated session state and bot response text.
- `GraphRunner` orchestrator that picks the correct node sequence based on the current phase and returns a `TurnOutput` (`responseText`, `session`).

## Node Set Implemented Now
1. `TopicClassifierNode` – detect topic keywords from the learner message.
2. `StoryOpeningNode` – craft the opening paragraph and seed session story parts.
3. `StoryContinuationNode` – generate follow-up paragraphs based on learner input and previous story parts.
4. `StoryCompletionNode` – final paragraph, mark completion, and provide closing message.

## Deliverables
- Updated shared types in `packages/story-types` with the contracts above.
- Implementations for the four nodes plus a `GraphRunner` in `packages/story-engine`.
- Basic vitest coverage proving the happy-path flow from fresh session to completion across multiple user turns.
- Documentation snippet appended to the main plan summarising the prototype capability and next enhancements (design-phase hooks, vocabulary branch, telemetry integration).
