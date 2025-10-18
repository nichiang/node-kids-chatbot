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

## Node Palette by Story Phase (non-technical naming)

### Phase 1 · Topic Discovery & Kickoff
- **Topic Listener** – picks up the child’s chosen topic or key words; powers theme selection UI (`utils.extract_topic_from_message`).
- **Story Spark** – runs the story opening prompt and returns the first paragraph with suggested bold vocabulary (`storywriting_prompts.story_generation.story_opening`).
- **Theme Whisperer** – recommends the visual theme for the UI based on the topic (`content/theme-config.json`).

### Phase 2 · Character & World Design
- **Design Doorway** – checks the opening story for unnamed characters/locations and invites the child into design mode.
- **Name It!** – friendly naming prompt for a new character or place (`design_templates.<type>.naming`).
- **Character Spotlight** – ask-for-details card using character aspect prompts (appearance, personality, dreams).
- **Setting Spotlight** – same as above but for locations (sights, sounds, special details).
- **Design Wrap** – sends a celebratory message, saves design choices, and hands control back to the story flow with a tailored continuation prompt.

### Phase 3 · Story Building Loop
- **Child Turn Capture** – stores the child’s text verbatim in the story timeline.
- **Writing Coach** – optional grammar/growth feedback bubble (`storywriting_prompts.grammar_feedback`).
- **Story Compass** – periodic narrative check-in that labels the current phase and conflict (`storywriting_prompts.story_assessment.arc_analysis`).
- **Conflict Booster** – adds conflict guidance when the story feels flat (`storywriting_prompts.narrative_enhancement.conflict_scenarios`).
- **Story Builder** – main continuation prompt that stitches the next paragraph together using the latest context and vocab.
- **Story Vault** – appends the bot paragraph, tracks vocab words, updates progress counters.

### Phase 4 · Story Wrap-Up & Encore
- **Ending Decision** – reviews pacing metrics to decide if it’s time for a finale (`prompt_manager.should_end_story_intelligently`).
- **Story Finale** – produces the closing paragraph with “The end!” and flags the story as complete.
- **Encore Invitation** – sends the friendly follow-up message about starting another adventure (`storywriting_prompts.completion_prompts.new_story_invitation`).
- **Fresh Start Prep** – clears story-specific state while keeping the same session for the next topic.

### Phase 5 · Vocabulary Quest
- **Launch Vocabulary Quest** – introduces the quiz and generates the first question from recent story words.
- **Next Challenge** – fetches the next word either from story content or curated backups.
- **Quest Complete** – thanks the learner, marks the vocabulary phase as done, and toggles the “awaiting new story” flag.

### Always-On Helpers
- **Session Keeper** – maintains session IDs, story IDs, and turn counters.
- **Learning Log** – wraps latency + educational telemetry events for any LLM call.
- **Vocabulary Monitor** – keeps the running list of asked/available vocab words for logging and quiz generation.
- **Response Builder** – assembles the final payload for the frontend (story text, design card, vocab question, theme hint).

Each node name mirrors the language a facilitator would expect inside the visual editor, while the description links the node to its current Python implementation and prompt assets.
## Suggested Graph Skeleton (happy path)
1. **Session Keeper** → **Vocabulary Monitor** → **Learning Log** (baseline nodes run on every turn).
2. **Topic Listener** → **Story Spark** → **Theme Whisperer**.
3. **Design Doorway** decides whether to branch into Phase 2:
   - If yes: **Name It!** → (**Character Spotlight**/**Setting Spotlight** as needed) → **Design Wrap** → back to Phase 3.
   - If no: continue to Phase 3 directly.
4. **Child Turn Capture** → optional **Writing Coach**.
5. Every few turns: **Story Compass**; if narrative feels flat, insert **Conflict Booster** guidance before the next prompt.
6. **Story Builder** → **Story Vault** (stores paragraph, updates vocab/theme info).
7. **Ending Decision** evaluates whether to finish:
   - If true: **Story Finale** → **Launch Vocabulary Quest**.
   - If false: loop back to **Child Turn Capture** for the next exchange.
8. Vocabulary path: **Next Challenge** (repeat up to max questions) → **Quest Complete**.
9. Post-quiz: **Encore Invitation** asks about another story. Positive replies trigger **Fresh Start Prep** and return to Step 2.
## Open Questions / Assumptions
- Legacy fun-facts fields remain untouched but must stay on the shared schema for compatibility.
- Conflict scale (`conflictScale`) is currently only set in PromptManager guidance; confirm whether additional detection is needed in the node graph.
- Design flow currently stops after two aspects per entity; future editor should allow configurable aspect count per node.

