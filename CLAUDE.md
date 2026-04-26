# Drawlot — Claude Code Instructions

## Project overview
Full-stack Next.js 14 app for ArenaPlus iGaming. Authenticated users run random prize draws from CSV/XLSX/TXT participant lists. Results are persisted and viewable on a dashboard.

## Tech stack
- **Next.js 14.2** — App Router, TypeScript, Tailwind CSS
- **NextAuth v4** — Credentials provider, JWT strategy (no DB adapter)
- **Prisma 5 + SQLite** — `prisma/dev.db`, schema at `prisma/schema.prisma`
- **bcryptjs** — password hashing (cost 12)
- **Radix UI** — Dialog, Label, Select, Separator, Slot, Toast primitives
- **date-fns, lucide-react, xlsx, papaparse**

## Setup (first time or after clean clone)
```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db and seeds admin user
npm run dev
```

Default login: `admin@admin.com` / `123`

`.env` must contain `DATABASE_URL="file:./prisma/dev.db"`.
`.env.local` contains `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `DATABASE_URL` for Next.js runtime.

## Key directories
```
app/
  page.tsx                # public landing page (/)
  (protected)/            # auth-gated pages (layout checks session, redirects if none)
    dashboard/            # draw history + stats
    picker/               # the random picker UI
  api/
    auth/[...nextauth]/   # NextAuth handler
    draws/                # GET (paginated), POST (create draw)
    draws/[id]/           # DELETE
    draws/[id]/export/    # GET → CSV download
    register/             # POST → create new user account
  login/                  # public
  register/               # public — account creation form
  layout.tsx              # imports globals.css + styles/picker.css globally
  providers.tsx           # SessionProvider + Toaster

components/
  picker/
    PickerApp.tsx         # main picker client component
    TweaksPanel.tsx       # floating design-tool panel (activates via postMessage)
    PosterRenderer.ts     # canvas → 1080×1350 JPEG poster blob
  dashboard/
    Sidebar.tsx
    StatsCards.tsx
    DrawHistoryTable.tsx
  ui/                     # shadcn-style primitives (button, badge, dialog, toast)

lib/
  auth.ts                 # NextAuth authOptions
  prisma.ts               # singleton PrismaClient
  randomize.ts            # pickWinners (Fisher-Yates, crypto.getRandomValues) + pickWeightedWinners
  parsers.ts              # CSV/TXT text parsers
  utils.ts                # cn() helper

styles/
  picker.css              # picker-specific CSS scoped to .picker-page wrapper class

prisma/
  schema.prisma           # User (id, name?, email, password), Draw models
  seed.ts                 # creates admin@admin.com / 123
```

## Public routes (no auth required)
`/`, `/login`, `/register`, `/api/auth/**`, `/api/register`, static assets, logo PNGs.
Everything else is protected by NextAuth middleware (`middleware.ts`).

## Authentication & accounts
- Users sign in via Credentials provider; JWT session (no DB adapter needed).
- **Registration**: `POST /api/register` — validates fields, checks for duplicate email, bcrypt-hashes password, creates `User` row. Redirects to `/login?registered=1` on success, which shows a green confirmation banner.
- Session user id: `(session.user as { id: string }).id` — typed in `types/next-auth.d.ts`.
- The seeded `admin@admin.com` account has no `name` (nullable field); new accounts from the register form always have a name.

## Register page — password strength
`app/register/page.tsx` enforces a minimum strength of **Good (score ≥ 3)** before the submit button enables. Scoring:
- +1 length ≥ 8 chars
- +1 length ≥ 12 chars
- +1 has uppercase AND lowercase
- +1 has a digit
- +1 has a special character

Score 1 = Weak (red), 2 = Fair (orange), 3 = Good (yellow), 4 = Strong (green). The 4-segment bar and requirements checklist update live as the user types.

## Picker — business rules
- **Max winners per draw: 100.** Enforced in `setCountSafe`, the number input `max`, the `+` button guard, and the slider in `PickerApp.tsx`. Do not raise this without updating all four places.
- **Duplicate detection**: when the raw name list contains duplicates, a yellow warning banner offers two modes — *Deduplicate* (pick from `uniqueNames`) or *Weighted odds* (pick from full pool, higher frequency = higher chance). Mode is stored in `allowDuplicates` state.
- **Fullscreen mode**: a `Maximize2/Minimize2` button in the picker topbar toggles `isFullscreen` state, which adds/removes the class `picker-expanded` on `<html>`. `styles/picker.css` contains `html.picker-expanded aside { display: none }` to hide the sidebar. The effect cleanup removes the class when navigating away, so the sidebar is always restored on other pages.

## CSS scoping
The picker has its own dark iGaming CSS (`styles/picker.css`) imported globally from `app/layout.tsx`. All picker rules are scoped to `.picker-page` — the wrapper div rendered by `app/(protected)/picker/page.tsx`. Do not add `body`-level rules to picker.css; scope them to `.picker-page` instead.

## Randomization
Always use `lib/randomize.ts` for picks — never `Math.random()`.
- `pickWinners(pool, count)` — Fisher-Yates on deduplicated list, no repeat winners.
- `pickWeightedWinners(pool, count)` — shuffle full pool (may have duplicate names), collect first N unique names (higher frequency = higher odds).

## Dashboard — UI conventions
- **Delete confirmation**: uses a custom Radix `Dialog`, not `window.confirm`. State is `confirmDeleteId: string | null`. The trash button sets it; the dialog's confirm button calls `handleDelete(confirmDeleteId)`. Never reintroduce `window.confirm`.

## DB schema notes
- `User.name` is `String?` (nullable) — seeded admin has no name, registered users always do.
- `Draw.participants` and `Draw.winners` are stored as JSON strings (`JSON.stringify(array)`).
- The POST `/api/draws` validates `new Set(winners).size === winners.length` — duplicate winners are rejected at the API level.
- `Draw.sourceType`: `"file"` | `"manual"`. `Draw.sourceName`: filename or `null`.

## React Strict Mode — side effects in PickerApp
Next.js dev runs React Strict Mode, which invokes state updater functions and effects twice. **Never call `fetch` or other one-shot side effects inside a `setState` updater.**

The DB save in `PickerApp.tsx` uses this pattern to stay safe:
- `savedRef = useRef(false)` — reset to `false` at the start of each `pick()`.
- `onReelDone` only increments `finishedCount`: `setFinishedCount(c => c + 1)`.
- A `useEffect` on `finishedCount` detects completion, checks `!savedRef.current`, sets it to `true`, then calls `saveDrawToDB`. Strict Mode re-runs the effect but the ref is already `true` so the API call is skipped on the second pass.

Apply the same pattern anywhere else a one-shot fetch must fire in response to a state transition.

## `useSearchParams` — Suspense boundary required
Any component calling `useSearchParams()` must be wrapped in `<Suspense>` or Next.js 14 will throw a prerender error. Pattern used in `app/login/page.tsx`: extract the interactive part into `<LoginForm>` (which calls `useSearchParams`), render it inside `<Suspense fallback={...}>` in the default export.

## Stale `.next` cache
If the dev server throws `Cannot find module './NNN.js'`, the chunk manifest is stale. Fix:
```bash
rm -rf .next && npm run dev
```

## After schema changes
```bash
npx prisma migrate dev --name <description>
```
If the dev server is running, the Prisma client DLL may be locked (Windows). Stop the server first, run the migration, then restart.

## Common commands
```bash
npm run dev        # development server on :3000
npm run build      # production build
npx tsc --noEmit   # type-check only
npx prisma studio  # GUI for the SQLite DB
```
