# Story Content Migration Plan

## Objectives
- Move story-related prompts, strings, and configuration from the Python backend (`backend/content`) into the new TypeScript content package (`packages/story-content`).
- Preserve schema validation, versioning, and editability for non-technical users via the node editor.

## Assets to Migrate

### Phase 1 Data Set (MVP)
- Story opening, continuation, and finale prompts
- Core bot responses (errors, story ending, vocabulary intro/next/completion)
- Topic keywords + theme mapping
- Vocabulary question prompt and grammar feedback template

### Full Catalogue
1. **Prompt Templates**
   - `storywriting-prompts.json` (story opening, continuation, ending, conflict, assessment).
   - `character-design-prompts.json` (naming, aspects).
   - `shared-prompts.json` (vocabulary flows, grammar feedback).
   - `funfacts-prompts.json` (defer to later phase).

2. **Strings & Bot Responses**
   - `strings/bot_responses.json` (mode error, completion messages).
   - `strings/ui_messages.json`, `strings/educational_feedback.json` (for future integration).

3. **Configuration**
   - `config/topics.json` (topic metadata).
   - `config/educational_parameters.json`.

## Migration Strategy
1. **Schema Definition**
   - Create JSON Schema definitions for prompts, strings, and config structures in `packages/story-content/src/schemas/`.
   - Provide TypeScript types that mirror the schema for runtime validation.

2. **Data Transformation Scripts**
   - Build Node.js migration scripts (`tools/migrate-prompts.ts`) to read Python JSON, validate against new schema, and emit TypeScript-friendly JSON files.
   - Store migrated data under `packages/story-content/data/` with versioning.

3. **Content Loader Updates**
   - Replace placeholder functions in `@kids-chatbot/story-content` with schema-validated loaders that pull from the new data files.
   - Expose accessor functions for prompts, bot responses, and topic metadata.

4. **Version Control & Backups**
   - Keep original Python JSON files until migration validated.
   - Add tests ensuring parity between old and new content (spot checks or hash comparisons).

5. **Editor Integration**
   - Surface migrated prompts within the React node editor, using the same schema to populate property panels.
   - Supply utility to export updated graphs/prompt configurations back to JSON for commit.

## Automation Checklist
- [ ] Define JSON Schemas for prompts and bot responses.
- [ ] Implement migration scripts to convert Python assets to new schema.
- [ ] Update `@kids-chatbot/story-content` loaders to use migrated data and schemas.
- [ ] Add tests verifying key prompts match legacy content.
- [ ] Establish editor import/export pipeline for modified content.

## Automation Workflow
1. Run `npm run migrate:prompts` (to be created) to transform Python prompts into TypeScript-friendly JSON.
2. Run `npm run validate:content` to execute schema validation tests.
3. Commit versioned data under `packages/story-content/data/`.
4. Update editor graphs and regenerate previews.
