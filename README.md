# LIZI — Music Collaboration Platform

LIZI connects Israeli musicians — find bandmates, discover artists, join projects, post events, and collaborate, all in one place.

**Live:** deployed on Vercel · **Contact:** lizimusicplatform@gmail.com

---

## Features

| Page | What it does |
|---|---|
| **Open Stage** `/open-stage` | Browse artists with match-scoring based on your profile (genre, instruments, location, style, age) |
| **Find Bandmate** `/find-bandmate` | Post and browse musician listings filtered by instrument, genre, and city |
| **Events** `/events` | Find and post jam sessions, gigs, workshops, open mics, and rehearsals |
| **Collaboration** `/collaboration` | Create and join music projects; invite artists via in-app chat |
| **Search** `/search` | Full-text + filter search across artists and projects, with **voice search** (Hebrew & English) |
| **Profile** `/profile` | Upload tracks, manage projects, edit preferences, save Favourites |
| **Feed** `/feed` | Social activity feed |
| **Messages** `/messages` | Project-based messaging |
| **Contact** `/contact` | Contact form with copy-to-clipboard email |

**Cross-cutting features:**
- **Favourites** — heart any artist, event, bandmate listing, or project; all appear in your Profile
- **Geolocation** — auto-detect your city (24 Israeli cities via Haversine distance), "Near You" badges on cards, auto-fill location filters
- **Voice search** — Web Speech API, real-time interim results, language follows the app toggle
- **Bilingual** — full Hebrew (RTL) and English, toggle in the navbar, persisted across sessions
- **Dark / Light theme** — toggle in the navbar
- **Fully responsive** — hamburger nav, collapsing grids, bottom-sheet modals on mobile

---

## Tech Stack

- **React 18** + **Vite 5** + **React Router 6**
- **Supabase** — PostgreSQL, Storage, Auth (Google OAuth supported)
- **Plain CSS** with CSS custom properties — no UI framework
- **Vitest** + jsdom for unit tests
- `localStorage` mock — the entire app works without a live Supabase project

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> Leave these empty and the app falls back to a `localStorage` mock automatically — all features work without a real database.

### 3. Run

```bash
npm run dev        # http://localhost:5173
```

---

## Scripts

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build → dist/
npm run preview      # Serve the production build locally
npm run lint         # ESLint (0 warnings policy)
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run test:ui      # Vitest visual UI
npm run mock-server  # Mock auth REST server on port 4000
```

Run a single test file:

```bash
npx vitest run src/test/liziMusic.test.js
```

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx            # Navbar, hamburger menu, geo banner, theme toggle
│   ├── Layout.css
│   ├── LocationDetector.css  # Geo banner + Near You badge styles (global)
│   ├── BandBackground.jsx
│   ├── UploadTrack.jsx
│   └── AvatarUpload.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── OpenStage.jsx         # Artist discovery + match scoring
│   ├── FindBandmate.jsx
│   ├── Events.jsx
│   ├── Collaboration.jsx
│   ├── Search.jsx            # Voice search + text + filters
│   ├── Profile.jsx           # Tracks, projects, favourites
│   ├── Feed.jsx
│   ├── Messages.jsx
│   ├── Contact.jsx
│   ├── About.jsx
│   ├── Memorial.jsx
│   ├── Login.jsx
│   └── Pages.css             # All page styles + mobile responsive
│
├── hooks/
│   ├── useFavourites.js      # localStorage-backed favourites (heart toggle)
│   └── useGeolocation.js
│
├── lib/
│   ├── supabase.js           # Supabase client (real or mock, auto-detected)
│   ├── db.js                 # All DB operations; falls back to localStorage on error
│   ├── geolocation.js        # Haversine formula, 24 Israeli cities, proximity labels
│   └── authApi.js
│
├── GeoContext.jsx            # Global geolocation state (city, status, detect, clear)
├── AuthContext.jsx
├── LanguageContext.jsx       # Language toggle, RTL, t() translation helper
├── translations.js           # en + he strings (dot-notation access)
├── data/artists.js           # Seed artist data (Supabase fallback)
└── styles/global.css         # CSS variables, dark/light theme, RTL
```

---

## Architecture Notes

### Context providers (App.jsx wrapping order)

```
<LanguageProvider>
  <AuthProvider>
    <GeoProvider>          ← city shared app-wide
      <AppContent />
    </GeoProvider>
  </AuthProvider>
</LanguageProvider>
```

### Data layer

`src/lib/db.js` tries Supabase first for every operation and silently falls back to `localStorage` on any error. Local projects are stored under `lizi_local_projects`; project members under `lizi_project_members`.

### Supabase tables

| Table | Purpose |
|---|---|
| `artists` | Artist profiles |
| `projects` | Collaboration projects |
| `project_members` | Users ↔ projects join table |
| `Lizi Music` | User track uploads (note: space in name) |
| `profiles` | Extended user metadata |

Storage buckets: `tracks` (audio, max 50 MB), `avatars` (images, max 5 MB; base64 fallback)

### Translations

```js
const { t } = useLanguage();
t('nav.home')       // → 'Home'   or  'בית'
t('geo.nearYou')    // → 'Near You'  or  'קרוב אליך'
```

Dot-notation is supported. If a key is missing, the key string itself is returned (never blank).

### Geolocation

`GeoContext` wraps the whole app and holds `{ city, status, detect, clear }`. On mount it silently auto-detects if the browser already granted permission. The detected city is cached in `localStorage` under `lizi_detected_location`.

`src/lib/geolocation.js` exports:
- `CITY_COORDS` — 24 Israeli cities with lat/lng
- `nearestCity(lat, lng)` — Haversine nearest-city lookup
- `proximityLabel(userCity, targetLocation)` — returns `'exact' | 'nearby' | 'remote' | null`

---

## Testing

Tests live in `src/test/`. Mock Supabase with `vi.mock`:

```js
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ data: [], error: null }) }),
  },
}));
```

See `src/test/liziMusic.test.js` for the full chained query builder mock pattern.

---

## Deployment

Deployed on **Vercel** as a static SPA. Build output goes to `dist/`:

```bash
npm run build
```

No server-side rendering — React Router handles client-side navigation.

---

## License

Private and proprietary. All rights reserved.
