# NFL Quiz Central

NFL Quiz Central lets football fans play NFL trivia, learn from answer explanations, and compare saved scores on a public leaderboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server on its managed workflow port
- `pnpm --filter @workspace/nfl-quiz-central run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required environment: `DATABASE_URL` for PostgreSQL

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Authentication: Replit-managed Clerk for registration, sign-in, and protected quiz gameplay
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nfl-quiz-central/` — React/Vite app and theme
- `artifacts/api-server/src/routes/quizzes.ts` — quiz, attempt, leaderboard, and summary API routes
- `artifacts/api-server/src/lib/quiz-catalog.ts` — idempotently seeded starter quiz content
- `lib/db/src/schema/quizzes.ts` — PostgreSQL schema for quizzes, questions, and attempts
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- The shared API server and generated OpenAPI client are used across the app; frontend requests should use generated hooks.
- Correct answers stay on the server until submission, and the server calculates and persists every score.
- Quiz discovery, community stats, and the leaderboard are public; loading quiz questions, viewing results, and submitting scores require a Clerk account.
- Attempts are associated with the signed-in Clerk user; leaderboard entries show a player-selected display name.
- Starter quiz content is inserted idempotently when the API starts.

## Product

- Browse curated NFL quizzes by topic and difficulty.
- Play multiple-choice quizzes with progress tracking and immediate results.
- Review saved answer explanations after finishing a quiz.
- View the public leaderboard and overall play statistics.

## User preferences

The starter visual identity comes from the source repository's football palette: turf green, championship gold, stadium cream, and scoreboard dark.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run codegen before importing the updated API types or hooks.
- Push development schema changes before starting the API server against a fresh database.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
