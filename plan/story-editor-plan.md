# Story Editor Architecture Plan

## Goals
- Provide a React-based visual editor that mirrors the story flow node taxonomy, enabling non-technical users to author and test story graphs.
- Integrate React Flow for node graph visualization, adding custom node renderers for story phases (topic, design, writing, wrap-up, vocabulary).
- Support real-time preview by simulating the graph against the story engine prototype.

## Core Requirements
1. **Node Palette**
   - Topic discovery nodes: Topic Classifier, Opening Story Prompt, Theme Recommender.
   - Design collaboration nodes: Design Trigger, Entity Naming Prompt, Character Detail Prompt, Setting Detail Prompt, Design Completion Handler.
   - Story development nodes: Learner Turn Recorder, Feedback Coach, Narrative Assessment, Conflict Guidance, Continuation Prompt, Story State Updater.
   - Completion nodes: Ending Evaluator, Finale Prompt, Restart Invitation, Session Reset.
   - Vocabulary nodes (placeholder for later): Vocabulary Intro, Vocabulary Question Prompt, Vocabulary Completion.
   - Shared utilities: Session Manager, Telemetry Logger, Vocabulary Tracker, Response Assembler.

2. **Graph Authoring UX**
   - Sidebar palette grouped by phases.
   - Property inspector for configuring prompt inputs, vocabulary parameters, telemetry toggles.
   - Mini-map and zoom controls for complex graphs.
   - Node validation badges (e.g., missing prompt reference).

3. **Simulation Tools**
   - Right-hand panel allows test conversation runs using the story engine API.
   - Shows turn-by-turn session state (phase, turnId, storyParts) and telemetry events.
   - Ability to save/load graph revisions (backed by upcoming content package integration).

## Technical Approach
- Use Vite + React 18 + TypeScript in `apps/story-editor`.
- Add React Flow for canvas rendering and Zustand (or Redux Toolkit) for editor state management.
- Reuse shared types from `@kids-chatbot/story-types` and content helpers from `@kids-chatbot/story-content`.
- Define a `GraphDefinition` schema stored in JSON (node list, edges, metadata). Serialize to content package.

## Incremental Deliverables
1. Scaffold React Flow canvas with static palette and mock node data.
2. Implement node inspector framework using controlled forms and TypeScript schemas.
3. Connect to story engine prototype for real-time simulation (mock API until backend exists).
4. Persist graphs via local storage or JSON files; integrate with content package once ready.
5. Polish UI with branding, accessibility, tutorials.
