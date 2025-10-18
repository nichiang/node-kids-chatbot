# @kids-chatbot/story-content

Shared prompt/content accessors for the storywriting flow.

## Data Layout
- JSON files live under `data/` (e.g., `story-prompts.json`, `bot-responses.json`, `topics.json`, `vocabulary-prompts.json`).
- TypeScript loaders in `src/index.ts` import those files (using `assert { type: "json" }`) and expose helper functions such as `renderStoryOpening` or `lookupBotResponse`.
- The structure is intentionally editor-friendly: each JSON entry contains a `prompt_template` plus a `variables` list, making it easy to surface in property panels later.

## Next Steps
- Add JSON Schemas to validate content at build/test time.
- Expand the data set with design-phase prompts, conflict guidance, and fun-facts once the engine requires them.
