# Node-Based Refactor Plan (Storywriting Focus)

## Overview
- Rebuild the storywriting experience from the current FastAPI service (`backend/app.py`) into a TypeScript-first monorepo (npm workspaces with option to layer Nx later) with clearly separated packages for the graph engine, shared types/content, and the visual editor.
- Keep content and prompt assets externalized by migrating the story-related JSON from `backend/content_manager.py` into a versioned content package that both the engine and editor consume with schema validation.

## Story Flow Discovery & Domain Mapping
- Trace the existing storywriting dispatcher (`backend/services/storywriting/orchestrator.py`) and downstream flows (topic initialization, writing continuation, design phase, vocabulary checks, completion) to produce a precise domain model covering session state transitions and required side effects.
- Define the initial node taxonomy for storywriting: system prompts, user input gates, content lookups, LLM interactions, session mutations, branching conditions, vocabulary quiz generation, and telemetry emitters. Capture I/O contracts for each node based on the Python implementation.
- Audit story-specific content, prompts, and configuration under `backend/content` and map every asset to its future node configuration or shared content schema.

## Graph Engine & API (Storywriting Scope)
- Scaffold a Fastify/NestJS-based API package with Zod/TypeBox schemas mirroring `models/schemas.py` for session payloads, focusing on story-related fields (conversation phase, design metadata, vocabulary progress, telemetry IDs).
- Implement the graph execution runtime capable of loading story graphs, resolving node handlers (topic selection, design instructions, vocabulary logic, narrative continuation, completion handling), managing async LLM calls, and updating session state deterministically. A prototype stub now lives in `packages/story-engine` to cover the topic → writing → completion path with template responses.
- Port the Python story services into TypeScript modules aligned with the node taxonomy: topic bootstrap, story continuation, design phase management, vocabulary quiz lifecycle, completion/recap routines. Leave fun facts for a later phase.
- Provide LLM/provider adapters abstracted behind interfaces so story nodes can swap providers and support deterministic fixtures for testing.

## Story Editor UI
- Build a React + TypeScript editor (Vite or Next.js) using React Flow (or similar) to author story graphs with node palettes reflecting the storywriting node types defined above.
- Add property panels that let non-technical users configure prompts, content references, vocabulary settings, and branching logic; surface contextual guidance pulled from the shared content package.
- Deliver simulation tooling limited to the story path: allow running sample conversations against the backend sandbox endpoint to visualize node transitions, session state mutations, and telemetry output.

## Shared Content & Configuration
- Create a shared `@kids-chatbot/story-content` package exposing story prompts, templates, localized strings, and validation schemas; ensure both engine and editor read/write through the same schema-enforced interface.
- Establish migration utilities to convert existing story prompts/content into the new schema, including automated checks for missing assets or mismatched placeholders.

## Workspace Structure
- Root-level `package.json` uses npm workspaces to define the monorepo backbone.
- `packages/story-types`, `packages/story-content`, and `packages/story-engine` house shared types, content adapters, and the execution runtime.
- `apps/story-api` wraps the engine with an HTTP interface; `apps/story-editor` is the React-based node editor scaffold.
- Shared tooling files (`tsconfig.base.json`, future ESLint/Vitest configs) live at the repo root for cross-package consistency.

## Telemetry, Testing, and DevOps (Story Phase)
- Re-implement latency and educational logging for storywriting as middleware/events within the new backend, emitting structured telemetry compatible with current analytics expectations.
- Build a testing strategy focused on the story flow: unit tests for node handlers, graph-level integration tests replaying legacy scenarios, and contract tests validating API compatibility with existing clients.
- Provide a staged rollout plan for replacing the Python story endpoint: dual-run mode, data backfill scripts for session state, and feature flags to gate the new graph engine before fun facts are migrated.

## Todo List
- [x] Produce a detailed storywriting domain map and node taxonomy document (see `plan/storywriting-domain-map.md`).
- [x] Decide on monorepo tooling and scaffold the TypeScript workspace for story components (see `plan/workspace-decision.md`).
- [x] Prototype the graph execution engine covering topic initialization through story completion (see `packages/story-engine`).
- [x] Port session lifecycle management and telemetry logging for the story path (see `packages/story-engine/src/session.ts` and `packages/story-engine/src/telemetry.ts`).
- [ ] Build the initial React Flow-based story editor with content integration.
- [ ] Create migration tooling for story prompts, templates, and session data.
