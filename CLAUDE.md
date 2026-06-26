# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LIZI is a music collaboration platform built with React 18 + Vite + React Router 6 and Supabase as the backend. It supports English and Hebrew (RTL) and has a dark/light theme toggle.

## Commands

```bash
npm run dev          # Start dev server (hot reload, default port 5173/5174)
npm run build        # Production build → dist/
npm run preview      # Serve the production build locally
npm run lint         # ESLint (0 warnings allowed)
npm run test         # Vitest (single run)
npm run test:watch   # Vitest in watch mode
npm run test:ui      # Vitest with visual UI
npm run mock-server  # Start mock auth REST server (node mock-auth-server.js, port 4000)
```

Run a single test file:
```bash
npx vitest run src/test/liziMusic.test.js
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

When these are absent or left as the placeholder values, `src/lib/supabase.js` exports a mock Supabase client that stores session data in `localStorage` under the key `supabase_user`. The app is fully usable without a real Supabase project.

## Architecture

### Context providers (wrap the whole app in this order)

| File | Purpose |
|---|---|
| `src/LanguageContext.jsx` | Language (`en`/`he`), RTL toggle, `t(key)` translation helper |
| `src/AuthContext.jsx` | Auth state (`user`, `isAuthenticated`, `signIn`, `signUp`, `logout`, `updateProfile`) backed by Supabase or mock |

`App.jsx` wraps everything in `<LanguageProvider><AuthProvider>`. The `<html>` element's `lang` and `dir` attributes are updated reactively when the language changes.

### Data layer (`src/lib/`)

- **`supabase.js`** — exports a single `supabase` client (real or mock). This is the only place the Supabase URL/key is read.
- **`db.js`** — all database operations. Every function tries Supabase first and silently falls back to `localStorage` on error. Local projects are stored in `localStorage` under `lizi_local_projects`; project members under `lizi_project_members`.
- **`authApi.js`** — helpers for the optional mock REST auth server.

Key Supabase tables used by `db.js`:
- `artists` — discovered via `fetchArtists()`
- `projects` — collaboration projects; CRUD via `fetchProjects`, `createProject`, `updateProject`, `deleteProject`, `joinProject`
- `project_members` — join table linking users to projects
- `Track` — user track uploads (columns: `id`, `user_id`, `title`, `genre`, `file_url`, `file_name`, `created_at`)
- `profiles` — user profile data referenced in project member queries
- Storage buckets: `tracks` (audio files, max 50 MB), `avatars` (images, max 5 MB; base64 fallback when bucket unavailable)

### Routing

`Login` is the only route rendered outside `<Layout>`. All other routes are children of `<Layout>`, which provides the shared navbar. Protected routes (`/profile`, `/dashboard`, `/messages`) redirect to `/login` when `isAuthenticated` is false.

### Styling

All colors and spacing use CSS variables defined in `src/styles/global.css`. Page-specific styles live in `src/pages/Pages.css`; `Layout` styles in `src/components/Layout.css`. Use `var(--text-primary)`, `var(--card-bg)`, `var(--border-color)`, etc. — never hardcode theme colors.

### Static fallback data

`src/data/artists.js` — seed artist list returned by `fetchArtists()` when Supabase is unavailable. `db.js` also contains an inline `fallbackProjects` array for the same purpose.

### Translations

`src/translations.js` exports a nested object with `en` and `he` keys. Access via the `t('nav.home')` helper from `useLanguage()`. Dot notation is supported for nested keys.

### Tests

Tests live in `src/test/`. Vitest is configured in `vite.config.js` with `jsdom` environment and setup file `src/test/setup.js`. Mock Supabase by calling `vi.mock('../lib/supabase', ...)` — the test in `liziMusic.test.js` is the reference pattern for mocking the chained Supabase query builder.
