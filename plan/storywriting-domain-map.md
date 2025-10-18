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

## Node Palette by Story Phase

### Phase 1 · Topic Discovery & Kickoff
- **Topic Classifier** – extracts the learner’s topic keywords; maps to theme selection (`utils.extract_topic_from_message`).
- **Opening Story Prompt** – story-opening LLM call that returns the first paragraph plus vocabulary suggestions (`storywriting_prompts.story_generation.story_opening`).
- **Theme Recommender** – suggests the frontend theme based on the detected topic (`content/theme-config.json`).

### Phase 2 · Design Collaboration
- **Design Trigger** – inspects the opening story for unnamed entities to decide whether to enter the design branch.
- **Entity Naming Prompt** – gathers a name for the current character or location (`design_templates.<type>.naming`).
- **Character Detail Prompt** – guided aspect prompt for characters (appearance, personality, goals).
- **Setting Detail Prompt** – guided aspect prompt for locations (sights, mood, special features).
- **Design Completion Handler** – stores the child’s inputs, emits a celebration message, and feeds the design summary to the next story continuation prompt.

### Phase 3 · Story Development Loop
- **Learner Turn Recorder** – saves the child’s message in the story transcript.
- **Feedback Coach** – optional grammar and writing feedback message (`storywriting_prompts.grammar_feedback`).
- **Narrative Assessment** – periodic LLM check that returns phase/conflict metadata (`storywriting_prompts.story_assessment.arc_analysis`).
- **Conflict Guidance** – enriches the next prompt with conflict hints when needed (`storywriting_prompts.narrative_enhancement.conflict_scenarios`).
- **Continuation Prompt** – main story continuation LLM call using the latest assessment/context.
- **Story State Updater** – appends the model response, tracks vocabulary usage, and advances progress counters.

### Phase 4 · Completion & Restart
- **Ending Evaluator** – decides whether to close the story based on pacing metrics (`prompt_manager.should_end_story_intelligently`).
- **Finale Prompt** – generates the closing paragraph and marks the story complete.
- **Restart Invitation** – offers new story ideas and toggles the awaiting-confirmation flag (`storywriting_prompts.completion_prompts.new_story_invitation`).
- **Session Reset** – clears story-specific state while keeping session identifiers for the next topic.

### Phase 5 · Vocabulary Practice
- **Vocabulary Intro** – launches the quiz, surfaces the first question from story-derived vocabulary.
- **Vocabulary Question Prompt** – retrieves subsequent questions from story context or curated lists.
- **Vocabulary Completion** – thanks the learner, marks the quiz complete, and returns control to the restart flow.

### Shared Utility Nodes
- **Session Manager** – maintains session IDs, story IDs, and turn counters.
- **Telemetry Logger** – wraps educational latency logging around LLM calls.
- **Vocabulary Tracker** – tracks asked words and available content vocabulary for quiz selection.
- **Response Assembler** – builds the API payload (story text, design prompt, vocab question, theme hint).

Names stay approachable but align more closely with the underlying behavior and code modules.
## Suggested Graph Skeleton (happy path)
1. **Session Manager** → **Vocabulary Tracker** → **Telemetry Logger** execute on every turn.
2. **Topic Classifier** → **Opening Story Prompt** → **Theme Recommender** start the conversation.
3. **Design Trigger** decides whether to branch into Phase 2:
   - If true: **Entity Naming Prompt** → (**Character Detail Prompt**/**Setting Detail Prompt** as needed) → **Design Completion Handler** → return to Phase 3.
   - If false: proceed directly to Phase 3.
4. Loop: **Learner Turn Recorder** → optional **Feedback Coach**.
5. Every few turns, run **Narrative Assessment**; inject **Conflict Guidance** when the assessment indicates low or missing conflict.
6. **Continuation Prompt** → **Story State Updater**.
7. **Ending Evaluator** decides whether to stop:
   - If yes: **Finale Prompt** → **Vocabulary Intro**.
   - If no: loop back to step 4.
8. Vocabulary path: repeat **Vocabulary Question Prompt** until limits reached → **Vocabulary Completion**.
9. After the quiz, **Restart Invitation** handles learner response; positive replies trigger **Session Reset** and return to step 2.
## Open Questions / Assumptions
- Legacy fun-facts fields remain untouched but must stay on the shared schema for compatibility.
- Conflict scale (`conflictScale`) is currently only set in PromptManager guidance; confirm whether additional detection is needed in the node graph.
- Design flow currently stops after two aspects per entity; future editor should allow configurable aspect count per node.

