# Monorepo Tooling Decision

## Requirements Snapshot
- Multiple TypeScript targets: story graph engine, API surface, React-based node editor, shared content/types.
- Native TypeScript project references and incremental builds without third-party wrappers.
- Deterministic package management that matches the wider ecosystem, minimizes extra tooling for new contributors.
- Straightforward command semantics for cross-package scripts.
- Room to bolt on task runners (Nx/Turbo) later without reorganizing packages.

## Options Considered
### pnpm Workspaces
- ✅ Fast installs, deterministic lockfile, good workspace UX.
- ⚠️ Introduces another tool for a largely npm-based team; some contributors unfamiliar with pnpm CLI flags.

### Turborepo + pnpm
- ✅ Modern task scheduler with cache awareness.
- ⚠️ Depends on pnpm (or yarn) and adds another layer of configuration before core refactor work begins.

### npm Workspaces (baseline)
- ✅ Built into Node 16+, no additional tooling for contributors to learn.
- ✅ Supports the workspace layout we need and plays nicely with TypeScript project references.
- ✅ Easy to integrate with future task runners if we outgrow the built-in commands.
- ⚠️ Lacks a task graph by default, so CI or future tooling will need to orchestrate ordering.

## Decision
Adopt **npm workspaces** for the storywriting refactor.
- Keeps the onboarding path simple for Python/JavaScript contributors already using npm.
- Provides the package layout we need without extra configuration overhead.
- Allows seamless migration to Nx/Turbo later while keeping the same directory structure.

## Immediate Next Steps
1. Manage workspaces through the root `package.json` (`workspaces` field) and remove pnpm-specific files.
2. Maintain the existing package/app scaffolds:
   - `packages/story-engine` – graph execution runtime.
   - `packages/story-content` – shared JSON schemas, prompts, and loaders.
   - `packages/story-types` – cross-cutting TypeScript types.
   - `apps/story-api` – Fastify/Nest-style API wrapper around the engine.
   - `apps/story-editor` – React-based node editor.
3. Update documentation/scripts to reference npm commands (`npm run build --workspaces`, `npm run dev --workspace story-api`, etc.).
