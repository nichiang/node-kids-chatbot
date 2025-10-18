# Storywriting Domain Map & Node Taxonomy

## Conversation Phases
- `NOT_STARTED` – no topic chosen, waiting for an opening user turn; router sends flow to topic initialization.
- `WRITING` – collaborative storytelling loop; alternates between user turns and model continuations.
- `DESIGNING` – temporary branch to co-create characters/locations; returns to `WRITING` once the entity is finalized.
- `VOCABULARY` – mini-quiz sequence after story completion; limited question count and telemetry logging.
- `COMPLETED` – story arc closed; system either invites vocabulary, waits for confirmation to restart, or idles until new topic suggested.

## Session State Model (story-focused)
- **Story Progress**: `topic`, `storyParts` (interleaves bot + user turns), `currentStep`, `isComplete`, `conversationPhase`, `awaiting_story_confirmation`.
- **Design Phase**: `designPhase`, `currentDesignAspect`, `designAspectHistory`, `designComplete`, `namingComplete`, `designedEntities`, `currentEntityType`, `currentEntityDescriptor`, `currentEntityName`, `entityNameOverrides`.
- **Narrative Assessment**: `storyPhase`, `conflictType`, `conflictScale`, `narrativeAssessment`, `characterGrowthScore`, `completenessScore`.
- **Vocabulary Tracking**: `vocabularyPhase` (questionsAsked, maxQuestions, isComplete), `askedVocabWords`, `contentVocabulary`.
- **Story IDs & Telemetry**: `session_id`, `turn_id`, `session_start`, `last_activity`, `current_story_id`, `story_history` (fun-fact fields unused in this scope but retained for compatibility).

## Flow Breakdown
1. **Session Bootstrap & Routing**
   - `manage_session_lifecycle` and `manage_content_ids` ensure IDs/turn counters exist for story mode.
   - Dispatcher order: vocabulary command check → topic initialization → design branch → main writing loop → completed flow fallback.

2. **Topic Initialization (new story)**
   - Input: first meaningful user utterance.
   - Steps: extract topic (`utils.extract_topic_from_message`), `prepare_session_for_topic` (sets topic, primes `currentStep`), build opening prompt via `prompt_manager.get_story_opening_prompt`, run `execute_story_prompt` (LLM call with vocab augmentation), parse structured response (`parse_story_response`), log vocabulary + story copy, and evaluate design decision.
   - Outcomes: either trigger design phase or transition to `WRITING` with opening paragraph and theme suggestion.

3. **Design Phase Branch (optional)**
   - Triggered when unnamed entities detected and design not skipped.
   - `trigger_enhanced_design_phase` selects next entity, seeds design state, and returns `DesignPrompt` UI payload.
   - User responses run through `handle_design_phase_interaction`: naming step (updates overrides) or aspect descriptions with grammar feedback + story continuation LLM calls. Finalizes entity and returns to `WRITING`.

4. **Writing Loop**
   - Each user message appended to `storyParts` (`_capture_user_turn`).
   - Grammar feedback via `llm_provider.provide_grammar_feedback` (optional).
   - Narrative assessment LLM runs after `currentStep >= 3` to produce `narrativeAssessment` and conflict hints.
   - Continuation prompt assembled (`_build_continuation_plan`) using assessment + conflict integration as needed; executed with vocab enrichment; output appended to `storyParts`, `currentStep` incremented.
   - Telemetry: vocabulary snapshots, educational interaction logs, optional grammar feedback event.

5. **Smart Ending Detection**
   - `_build_continuation_plan` asks PromptManager if story should conclude (`should_end_story_intelligently`).
   - When true: ending prompt used, response appended, `isComplete = True`, phase → `COMPLETED`.

6. **Vocabulary Mini-Flow**
   - Triggered by explicit commands (`start_vocabulary`, `next_vocabulary`, `finish_vocabulary`) typically after completion.
   - Generates question from story content words first, then curated fallback; logs telemetry, tracks asked words, enforces max count, and may mark phase complete (`finish_vocabulary`).

7. **Completed Story Handling & Restart**
   - While awaiting confirmation, positive intents reset session for a new topic (`reset_session_for_new_story`) and spin a fresh opening via `generate_initial_story_for_topic` (reuses initialization flow). Negative intents send goodbye and keep session idle.
   - Without confirmation flag, bot checks for spontaneous topic change suggestion and restarts when appropriate; else returns standard ending message.

## Node Taxonomy (initial storywriting set)

### Routing & Control Nodes
- **`SessionBootstrap`** – ensure session IDs/turn counters, emit normalized `SessionContext` object. *Inputs*: raw request. *Outputs*: updated session state.
- **`VocabularyCommandSwitch`** – branch when message equals `start/next/finish_vocabulary`; routes to vocabulary subgraph.
- **`ConversationPhaseRouter`** – state machine node mirroring current dispatcher logic to select between Topic Init, Design, Writing, Completed handlers.
- **`ConditionBranch`** – reusable boolean branch (e.g., `should_trigger_design`, `should_end_story`, `awaiting_confirmation`).

### Content & Prompt Nodes
- **`TopicExtractor`** – deterministic keyword extractor returning topic + theme ID.
- **`PromptTemplateLoader`** – fetch prompt strings or structured templates from shared content package (`storywriting_prompts`, `design_templates`, etc.).
- **`PromptComposer`** – assemble final prompt strings from templates plus runtime data (topic, story window, design summary, conflict guidance).

### LLM Interaction Nodes
- **`LLMStoryOpening`**, **`LLMStoryContinuation`**, **`LLMStoryEnding`** – story text generation; return rich payload `{story, entities, vocab, latency}`.
- **`LLMDesignContinuation`** – used after design inputs to weave child contributions back into narrative.
- **`LLMGrammarFeedback`** – optional grammar coaching text.
- **`LLMNarrativeAssessment`** – analyzes recent story arcs for phase/conflict guidance.
- **`LLMVocabularyQuestion`** – generates multiple-choice question JSON for a word.

### Post-Processing Nodes
- **`StoryParser`** – convert LLM JSON to structured entities, surface parse errors.
- **`DesignDecisionEvaluator`** – evaluate parsed entities against rules to decide design branch.
- **`ConflictGuidanceComposer`** – optional step to embed conflict instructions when assessment lacks conflict.
- **`VocabularySelector`** – pick candidate words (from story content or curated lists) ensuring no duplicates.

### Session Mutation Nodes
- **`SessionTopicInitializer`** – set topic, reset/prime counters, add opening text.
- **`StoryAppender`** – append bot/user turns to `storyParts`, increment steps, set `isComplete` when flagged.
- **`DesignStateManager`** – manage lifecycle of design entity (initialize, rotate aspects, finalize, persist overrides).
- **`VocabularyStateManager`** – update asked words, question counts, mark completion.
- **`NarrativeAssessmentUpdater`** – persist assessment metrics and conflict metadata.
- **`SessionResetForNewStory`** – clear story-specific fields while preserving identifiers.

### Telemetry & Logging Nodes
- **`EducationalEventLogger`** – wrap calls to latency logger with consistent payloads.
- **`VocabularySnapshotLogger`** – capture vocabulary state for observability.
- **`LatencyCollector`** – gather LLM call timings for downstream analytics.

### Output Nodes
- **`ChatResponseBuilder`** – construct API payload (`response`, `sessionData`, optional `designPrompt`, `vocabQuestion`, `suggestedTheme`).
- **`DesignPromptEmitter`** – package `DesignPrompt` UI data without story text mutation.

## Suggested Graph Skeleton (happy path)
1. `SessionBootstrap` → `VocabularyCommandSwitch`.
2. `ConversationPhaseRouter` → (Topic Init | Design Loop | Writing Loop | Completed Handler).
3. **Topic Init**: `TopicExtractor` → `PromptTemplateLoader` → `LLMStoryOpening` → `StoryParser` → `DesignDecisionEvaluator` → (`DesignStateManager` branch or `StoryAppender`).
4. **Writing Loop**: `StoryAppender` (user turn) → optional `LLMGrammarFeedback` → conditional `LLMNarrativeAssessment` → `PromptComposer` → `LLMStoryContinuation` → `StoryAppender` (bot turn) → `EducationalEventLogger` → `ConditionBranch(should_end_story)`.
5. **Completion Path**: when story ends, push `VocabularyStateManager`/`EducationalEventLogger` nodes, then `ChatResponseBuilder` with completion messaging.
6. **Vocabulary Subgraph**: `VocabularySelector` → `LLMVocabularyQuestion` → `VocabularyStateManager` → `EducationalEventLogger` → `ChatResponseBuilder`.
7. **Restart Path**: `ConditionBranch(awaiting_confirmation)` → (`SessionResetForNewStory` → return to Topic Init) or `ChatResponseBuilder` for goodbye message.

## Open Questions / Assumptions
- Legacy fun-facts fields remain untouched but must stay on the shared schema for compatibility.
- Conflict scale (`conflictScale`) is currently only set in PromptManager guidance; confirm whether additional detection is needed in the node graph.
- Design flow currently stops after two aspects per entity; future editor should allow configurable aspect count per node.

