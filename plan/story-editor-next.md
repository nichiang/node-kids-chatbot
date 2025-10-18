# Story Editor Build-Out Plan

## Goals
- Make the React Flow editor fully interactive: drag/drop nodes, edit node properties, and persist graph structure.
- Tie node configurations to real story content (prompts, responses) to ensure editor edits can drive the engine.
- Provide simulation features that mirror runtime behavior for rapid iteration by non-technical users.

## 1. Node Palette & Canvas Interactions
- Enable drag-and-drop from palette to canvas using React Flow’s `onDragOver`/`onDrop` handlers.
- Allow selecting nodes to open a property panel; support repositioning and deletion.
- Persist node/edge changes to the Zustand store and expose undo/redo hooks (consider `immer` or `use-undo`).

## 2. Node Property Panel
- Build a right-side inspector showing node type, prompt references, and custom metadata.
- Integrate content loaders: provide dropdowns for prompt IDs, bot responses, etc., pulled from `@kids-chatbot/story-content`.
- Validate inputs (e.g., missing promptRef) and surface warnings/badges on nodes.

## 3. Graph Persistence & Versioning
- Support saving/loading graphs as JSON via:
  - Workspace-local storage for drafts.
  - File export/import (already partially implemented) with improved UX and validation.
- Plan for future integration with a backend or Git storage for version history.

## 4. Simulation Enhancements
- Allow step-by-step simulation:
  - Show current session state (phase, topic, story so far) in the panel.
  - Option to pick a node path (e.g., bypass design nodes) for targeted testing.
- Visual feedback: highlight nodes/edges as the API returns responses.
- Queue test scenarios (e.g., sample prompts or recorded conversations).

## 5. Node Type Library
- Create reusable node definitions with metadata (e.g., default prompts, input fields, optional handles).
- Support handle configuration (multiple outgoing edges, conditional branches) for future flow logic.
- Document each node type inside the editor (tooltips, info popovers).

## 6. UX & Polishing
- Add mini-map toggles, zoom-to-fit shortcut, and viewport reset.
- Provide status indicators (connected to API, last simulation result).
- Improve styling for readability (consistent node colors per phase, grid background options).

## Todo
- [x] Implement drag/drop from palette with dynamic node creation.
- [x] Add node selection + property inspector panel.
- [ ] Wire prompt/content pickers to `@kids-chatbot/story-content` data.
- [ ] Persist graph state to local storage and enhance import/export validation.
- [ ] Show session state and node highlighting during simulations.
- [ ] Document editor workflows (how to create a new flow, run simulations, export). 
