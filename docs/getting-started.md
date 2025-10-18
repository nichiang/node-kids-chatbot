# Getting Started (Node Story Engine)

## Prerequisites
- Node.js 18+
- npm 10+
- OpenAI API key (or compatible provider) for live LLM calls

## Install Dependencies
```bash
npm install
```

## Environment Variables
Create a `.env` file at the repo root:
```env
OPENAI_API_KEY=sk-...
# Optional overrides
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
# STORY_API_URL=http://localhost:3000
```

TypeScript services automatically search the current working directory, package roots, and repo root for `.env`.

## Story Engine Smoke Test
Runs a three-turn conversation directly against the engine.
```bash
npm run smoke --workspace @kids-chatbot/story-engine
```

## Story HTTP API
Start the Fastify server (exposes `/health` and `/chat`).
```bash
npm run dev --workspace story-api
```

Interact via CLI:
```bash
npm run cli --workspace story-api
```

## Story Editor
Launch the React Flow editor (loads sample graph and simulation panel by default).
```bash
npm run dev --workspace story-editor
```

Simulation panel configuration:
- `Story API URL`: defaults to `http://localhost:3000`
- `Send` posts the message to `/chat` and shows the response
- `Reset Session` clears the cached session payload
- `Download`/`Import` allow editing graph JSON files under `apps/story-editor/src/graphs/`

## Content Data
Minimal story prompts, bot responses, topics, and vocabulary templates live under `packages/story-content/data/`. Accessors in `packages/story-content/src/index.ts` expose render helpers and lookup functions used by the engine and editor.

## Useful Scripts
- `npm run build --workspace @kids-chatbot/story-engine`
- `npm run build --workspace story-content`
- `npm run test --workspace @kids-chatbot/story-engine`

