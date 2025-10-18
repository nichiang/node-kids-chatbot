# @kids-chatbot/story-engine

Prototype story graph engine that drives the topic → writing → completion loop with deterministic placeholder prompts.

## Current Capabilities
- Detects a topic from learner input using keyword matching.
- Generates an opening paragraph, one continuation turn, and a finale using templates from `@kids-chatbot/story-content`.
- Advances and clones session state using shared types from `@kids-chatbot/story-types`.

## Next Up
- Add design-phase branching and vocabulary quiz hooks.
- Replace template strings with real prompt/content loaders.
- Introduce telemetry events and persistence once flows stabilize.
