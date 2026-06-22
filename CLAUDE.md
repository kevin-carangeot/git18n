# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

git18n is an internal web tool that automates i18n translation. It connects to a GitHub repo, reads the source locale file (`en.json`) on a chosen PR branch, diffs it against the repo's default branch to find new/changed keys, translates only those keys into target languages via Gemini, lets the user review/edit, then opens a new PR with the merged JSON.

## Commands

Package manager is **pnpm** (`shamefully-hoist=true` in `.npmrc`).

```bash
pnpm dev          # dev server on http://localhost:3000
pnpm build        # production build
pnpm generate     # static generation
pnpm preview      # preview a build
pnpm lint:fix     # eslint . --fix
pnpm format:fix   # prettier --write .
```

There is **no test suite** and no typecheck script. `pnpm postinstall` runs `nuxt prepare` (regenerates `.nuxt/`, including the ESLint and TS configs that `eslint.config.mjs` / `tsconfig.json` reference — run it after a fresh clone).

## Stack

Nuxt 4 (SPA — `ssr: false`), Vue 3 `<script setup>`, Nuxt UI 4, `@nuxtjs/i18n` for the app's own UI strings, `@google/generative-ai` (Gemini). Formatting is Prettier: **tabs (width 4), no semicolons, single quotes, printWidth 100**.

## Architecture

### Credentials live client-side, travel as headers

There are **no server-side secrets**. The user enters GitHub URL/token/folder and Gemini key into a config form; it's persisted to `localStorage` (`useGitConfig`, key `git18n-config`). The `app/plugins/api.ts` plugin wraps `$fetch` as `$api` and injects those values as `x-git18n-*` headers on every request. Server routes read them via `server/utils/git-config.ts` (`getGitConfig`), which also parses owner/repo out of the URL. **Always call server APIs through `useNuxtApp().$api`** — a plain `$fetch`/`useFetch` won't carry the credentials. The `.env.example` vars are legacy/reference only; runtime config comes from the headers.

### Server routes (`server/api/`) are thin GitHub/Gemini proxies

- `pulls.get` — lists open PRs as `{label, value: head.ref}`.
- `pr-diff.get` — fetches the locale file on the PR branch and on the repo default branch, computes the diff, returns `{ diff, visualDiff, count, baseBranch, headBranch, indentation }`.
- `translate.post` — sends a diff chunk + target lang to Gemini (`gemini-2.5-flash-lite`, temperature 0, JSON response mode).
- `create-pr.post` — creates `feat/i18n-update-<timestamp>` off the base branch, merges each language's translations into the existing file (preserving keys), commits per-language, opens a PR.

Server utils are pure functions worth knowing:

- `diff.ts` — `calculateJsonDiff` (recursive added/changed keys only) and `calculateDetailedDiff` (adds `status`/`old`/`new` for the visual review).
- `merge.ts` — deep-merges new translations over existing values without dropping untouched keys.
- `indent.ts` — sniffs the source file's indentation so the PR preserves it.
- `prompt.ts` — the Gemini translation prompt (in French); strict rules about not touching keys, placeholders `{…}`, or HTML.

### Main flow lives in `app/pages/index.vue`

When configured (`isConfigured`), it loads PRs, then on PR selection fetches the diff, then `startTranslation` loops over `targetLanguages` calling `/api/translate` (with a 500ms stagger between languages), populating editable per-language JSON. `createPullRequest` validates the edited JSON and posts to `/api/create-pr`. When not configured it shows `ConfigWizard`; `/settings` shows the same config via `ConfigForm`.

### Conventions

- Import aliases: `~/` → `app/`, `~~/` → project root (server uses `~~/server/...`).
- Languages are defined in `app/types/config.ts`: `SOURCE_LANGUAGE` (en, fixed) and `LANGUAGE_CATALOG` (selectable targets). Add a target language there.
- `app.config.ts` sets the Nuxt UI theme (primary `emerald`, neutral `slate`); CSS halo/gradient tokens are in `app/assets/css/main.css`.
- The app UI is fully internationalized — user-facing strings go through `t(...)` with keys in `i18n/locales/{en,fr}.json`, not hardcoded.
