# VELO — Current State (Web Repo)

> **Canonical document for web repo state**
> Created: 30 April 2026
> Updated: 2 May 2026 (post Public Vendor Experience CLOSED + LIVE)

---

## SMART CHECKLIST SUGGESTIONS — Deterministic MVP

**Status:** ✅ CLOSED + LIVE
**Commits:**
- `d68d616` — feat: add deterministic checklist suggestions MVP
- `4bcb8d4` — fix: harden checklist suggestion dedupe
**Live check:** ✅ Verified on velowedding.it

### What is closed:

- `normalizeTaskTitle()`: lowercase, trim, collapse spaces, strip basic punctuation
- `buildChecklistSuggestions()`: deterministic, no AI, max 3 suggestions shown
- Dedupe: primary via `task_key`, fallback via normalized title (checks `title`, `title_it`, `title_en` of every existing task)
- `documents_review`: broader guard — hidden if any task has `source='documents'`, `task_key` containing 'document', or any title variant containing 'document'/'documento'
- Rules (priority order):
  1. Missing `wedding_date` → `setup_wedding_date` (urgent)
  2. Foreign couple + no doc-related task found → `documents_review` (urgent)
  3. Missing `ceremony_type` → `setup_ceremony_type` (soon)
  4. Missing `budget` → `setup_budget` (soon)
  5. `guests` count = 0 → `guests_start` (soon)
- `SuggestionsSection` component: dashed-border cards, no emoji, premium editorial style
- `handleAddSuggestion`: insert-on-click only, `source='user'`, `system_generated=false`, `task_key` set
- Couples query expanded: `wedding_date, budget, ceremony_type` loaded alongside locale fields
- Lightweight guests count query: `head: true`, no row fetch
- Copy IT/EN inline in component (checklist uses local copy system, not `lib/translations.ts`)

### Non-automatic:
- Suggestions never inserted without explicit user click
- No vendor count check (no extra query for MVP)
- No AI, no notifications, no automations

### Git note:
- `8f432c5` — fix: remove stale Claude Code worktree gitlinks from index (git status now works)

### QA:
- `npm run build` — ✅ PASS
- `npx tsc --noEmit` — ✅ PASS (both sprints)
- Vercel/live check — ✅ PASS

---

## PUBLIC VENDOR EXPERIENCE — Light/Editorial Theme

**Status:** ✅ CLOSED + LIVE

**Commits:**
- `50e32d6` — feat(vendors): align public listing with VELO editorial style
- `1463426` — feat(vendors): align public vendor detail with light theme
- `a0209ab` — fix(vendors): polish public vendor detail light theme
- `1d8c1d0` — fix(vendors): finalize public vendor detail light theme
- `5429129` — final listing copy + PhotoLightbox polish

**Live response checks:**
- `/` returned 200
- `/fornitori` returned 200
- `/fornitori/[id]` sample public vendor detail returned 200

**What was closed:**

### Public Vendor Listing (`app/fornitori/page.tsx`)
- Visual refinements ONLY (no data logic changes)
- Background: dark → warm paper/cream (`bg-[#f3eadb] text-[#1f1812]`)
- Hero section: editorial serif title, cohesive with homepage
- Filters: elegant pills, warm borders (`border-[#c9a84c]/...`), less "marketplace dark"
- Vendor cards: light warm (`bg-[#fbf4e5]`), taller images (`h-56`), warm overlays
- Copy claims softened:
  - "in tutta Italia" → "in diverse regioni italiane"
  - "tutti i fornitori" → "fornitori"
  - "VEDO Partner program" → "VEDO Partners" (EN)
- No geocoding automatico, no ranking, no availability filtering added

### Public Vendor Detail (`app/fornitori/[id]/page.tsx`)
- Full conversion from dark/admin to light editorial theme
- Background: `bg-[#f3eadb] text-[#1f1812]` (cohesive with homepage)
- Hero: image-first card, light overlays for text readability
- Sidebar cards: light cream (`bg-[#fbf4e5]`), warm borders, ink text (`text-[#1f1812]`)
- RailCard components: converted from dark gradients to light cream/paper
- HeroPill/FactRow: light theme, warm accents (`text-[#c9a84c]`)
- CTA buttons: cohesive with homepage (primary terracotta, secondary light outline)
- No data queries changed, no contact logic changed, no PhotoLightbox refactor

### PhotoLightbox (`components/PhotoLightbox.tsx`)
- Localized labels: IT/EN (Featured/In evidenza, Portfolio/Portfolio, Open/Apri, Close/Chiudi, Prev/Prec, Next/Succ)
- Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-label` on buttons, `onKeyDown` for Escape
- Robustness: `safePhotos` filter, early return for empty gallery, handles 0/1/2/3+ photos
- No new features, no geocoding, no AI

**Residual Visual Issues:**
None blocking found.

**File/Line Problems:**
- Header/logo readable: `components/NavBar.tsx`, `components/SimpleNav.tsx` ✅
- Footer coherent: `components/PublicFooter.tsx` ✅
- Listing remains warm/editorial: `app/fornitori/page.tsx` ✅
- Vendor detail hero readable, image-first, no text over dark photo ✅
- Right rail no duplicated trust badge ✅
- PhotoLightbox controls readable ✅

**Build/Typecheck:**
- `npm run build` ✅ PASS
- `npx tsc --noEmit` ✅ PASS

**Safety:**
- No Supabase query changes
- No RLS changes
- No automatic geocoding
- No couple-profile ranking
- No availability/blocked-date filtering

**Product rule:**
- Public surfaces = light editorial
- Dark = vendor admin/private area only

---

## WEB COUPLE EXPANSION — Practical Actions v1

**Status:** ✅ CLOSED + LIVE

**Commits:**
- `a761a4c` — fix: uniform couple resolver + accurate web copy across /couple area
- `ee7dbd6` — fix: export explicit locale cookie helper (`hasExplicitLocaleCookie`)

**Deploy note:**
- First Vercel deploy of `a761a4c` failed: `hasExplicitLocaleCookie` imported but not exported from `lib/couple-locale.ts`.
- Hotfix `ee7dbd6` exported the function.
- Vercel production deploy now passes ✅.

### What is closed:

#### Budget (`app/couple/budget/page.tsx`)
- `/couple/budget` is no longer read-only
- Budget web CRUD:
  - Add expense (title, amount, category, confirmed)
  - Edit expense modal
  - Delete expense with confirmation
  - Toggle confirmed
- Budget uses `expenses` fields:
  - `title`
  - `amount`
  - `category`
  - `confirmed`
- No legacy `paid` field introduced

#### Guests (`app/couple/guests/page.tsx`)
- `/couple/guests` is no longer view-only
- Guests web update:
  - RSVP toggle (confirmed/pending/declined)
  - Edit notes
  - Edit dietary requirements
- Guests update patches only targeted fields
- Does NOT overwrite:
  - `plus_one`
  - `group_name`
  - `side`
  - `email`
  - `phone`

#### Couple resolver (all `/couple/*` pages)
- Current couple row uniformly resolved across entire `/couple` area
- Pattern: `user_id` + `created_at DESC, id DESC` + `limit(1)` + `maybeSingle()`
- Consistent in CoupleShell → pages
- Current couple row is resolved consistently across the /couple area using user_id + created_at desc + id desc + limit(1) + maybeSingle(). This avoids wrong-row selection on web, but duplicate DB rows can still exist and remain a data-integrity/RLS concern if present.

#### NEXT_LOCALE sovereignty
- Cookie `NEXT_LOCALE` always wins over `nationality`/`country_of_origin`
- All `/couple/*` pages respect locale from cookie
- Copy updated: web allows practical desktop actions; app remains daily driver

### Build & typecheck:
- `npm run build` — ✅ passes (relevant check for Vercel deploy)
- `npx tsc --noEmit` — standalone may fail due to `.next/types/**/*.ts` config issues; NOT a product blocker
- Tooling cleanup: deferred to future maintenance pass
- Codex final verify: ✅ CLOSED

### Non-blocking residue:
- ~~Budget/guests update/delete filter by `id` only~~ — **CLOSED** by WEB WRITE HARDENING sprint
- ~~Full security depends on Supabase RLS~~ — **SAFE** verified by Codex 5.5 elevated

---

## WEB WRITE HARDENING / RLS GUARD PASS

**Status:** ✅ CLOSED + LIVE
**Commits:**
- `d160c0a` — fix: harden web couple write guards
- `2414e01` — docs
**Live check:** ✅ Verified on velowedding.it

### What was closed:

#### Budget (`app/couple/budget/page.tsx`)
- Insert uses current `user_id`
- UPDATE (toggle confirmed/edit) filters: `id + user_id`
- DELETE filters: `id + user_id`
- No `paid` field introduced
- Write fields remain: `title`, `amount`, `category`, `confirmed`

#### Guests (`app/couple/guests/page.tsx`)
- UPDATE RSVP patches only `rsvp`
- UPDATE notes patches only `notes`
- UPDATE dietary patches only `dietary`
- Each update filters: `id + user_id`
- Does NOT touch: `plus_one`, `group_name`, `side`, `email`, `phone`

#### Checklist (`app/couple/checklist/page.tsx`)
- Insert uses `user_id`
- New web tasks: `source='user'`, `system_generated=false`, `completed=false`
- Toggle/edit/delete filter: `id + user_id`
- Edit/delete limited to user-created tasks
- Edit remains minimal patch
- Does NOT overwrite: `source`/`system_generated`/`priority`/`task_key`/`vendor_name`/`category`/`draft`/`title_it`/`title_en`/`completed`

#### Profile (`app/couple/profile/page.tsx`)
- Current couple resolver remains deterministic
- UPDATE couples uses `couple.id + user_id`
- `nationality`/`country_of_origin`/foreign status NOT touched
- `NEXT_LOCALE` explicit wins NOT touched

#### Dashboard & Vendors
- No pending writes found

### QA
- `npm run build` — ✅ PASS
- `npx tsc --noEmit` — ✅ PASS (in verified sprint environment)
- Codex 5.5 elevated final verify — ✅ CLOSED
- Vercel/live check — ✅ PASS

### Non-blocking residue:
- No SQL/migration/policy files in repo
- RLS verified SAFE by Codex 5.5 elevated
- No SQL changes applied
- No SQL recommended at this time

---

## SUPABASE RLS DIAGNOSTIC / VERIFICATION

**Status:** ✅ SAFE
**Verification:** Codex 5.5 elevated

### What was verified:
- RLS enabled on:
  - `couples`
  - `expenses`
  - `guests`
  - `tasks`
- Owner/admin/vendor policies sufficient for main risks
- Privacy cross-user: **SAFE**
- Admin regression risk: **SAFE**
- Vendor chat regression risk: **SAFE**
- No SQL applied
- No SQL recommended at this time

### Details:

#### couples
- Owner select/insert/update present
- Admin read present
- Vendor linked couple read present
- Vendor chat couple names read present
- No delete necessary
- No `unique(user_id)` applied at this time

#### expenses
- Owner policy `auth.uid() = user_id` present
- Budget privacy covered

#### guests
- Owner select/insert/update/delete present
- Admin read present
- Guests privacy covered

#### tasks
- Owner manage own tasks present
- Admin read present
- Vendor custom task policies present
- Privacy covered
- Product-integrity partial but acceptable:
  - Owner can manage own tasks via DB policy
  - Client limits edit/delete to `source='user'` && `system_generated !== true`
  - NOT restricting DB update/delete now because toggle completed on system-generated tasks must remain functional

### Future residues:
1. **Task product-integrity:**
   - Evaluate in future: trigger/policy refinement to prevent delete/edit of system-generated tasks via direct API without breaking toggle
2. **Duplicate couples:**
   - No `unique constraint` on `couples(user_id)`
   - Web resolver (latest-row deterministic) avoids wrong-row selection
   - Before adding unique constraint: need duplicate diagnostic and onboarding/dedupe verification

---

## WEB COUPLE COMPLETION — Profile + Checklist Light

**Status:** ✅ CLOSED + LIVE
**Commits:**
- `2d8c8f0` — feature: profile style/size editable on web + checklist add/edit/delete
- `2053ab7` — final checklist microfix / profile + checklist light sprint
**Live check:** ✅ Verified on velowedding.it

### Profile (`app/couple/profile/page.tsx`)
- Pre-existing edit retained for:
  - `wedding_date`
  - `budget`
  - `ceremony_type`
- Light edit added for:
  - `wedding_style`
  - `wedding_size`
- Partner names remain read-only
- city/region remain app-only (ambiguous location schema: `wedding_city`, `wedding_region`, `wedding_regione`, `wedding_province`)
- `nationality`, `country_of_origin`, foreign status NOT touched
- `NEXT_LOCALE` explicit wins NOT touched
- Profile update via `couple.id`

### Checklist (`app/couple/checklist/page.tsx`)
- Light editing now supported:
  - Add base task
  - Edit base task
  - Delete task with confirmation
  - Toggle complete/incomplete preserved
- New web-created tasks:
  - `source = 'user'`
  - `system_generated = false`
  - `completed = false`
- Edit/delete allowed only for user-created tasks:
  - `source === 'user'`
  - `system_generated !== true`
- Edit uses minimal patch:
  - Updates only changed fields
  - Does NOT send `title_it`/`title_en`
  - Does NOT overwrite `source`/`system_generated`/`priority`/`task_key`/`vendor_name`/`category`/`draft`/`completed`
- Toggle completed/incomplete NOT broken
- Dashboard data shape NOT broken

### QA
- `npm run build` — ✅ PASS
- Code verdict — ✅ CLOSED
- Codex verdict — ✅ CLOSED
- Vercel/live check — ✅ PASS
- `npx tsc --noEmit` standalone may still fail due to `.next/types/**/*.ts` config fragility; NOT a stable check until tooling cleanup

---

## Web Couple Area — Current Ownership

| Page | Status | Notes |
|---|---|---|
| `app/couple/dashboard/page.tsx` | ✅ Live | Countdown, next step, overview |
| `app/couple/profile/page.tsx` | ✅ Partial edit | date, budget, ceremony, style, size editable; names/region/city app-only |
| `app/couple/budget/page.tsx` | ✅ CRUD live | add/edit/delete expense, toggle confirmed |
| `app/couple/guests/page.tsx` | ✅ RSVP + notes/dietary live | NOT email invites, NOT table planner |
| `app/couple/vendors/page.tsx` | ✅ Read-only | Pipeline view, no edit |
| `app/couple/checklist/page.tsx` | ✅ Add / edit / delete / toggle + deterministic suggestions | user-created tasks only; suggestions are deterministic, no AI |
| `app/couple/documents/page.tsx` | ✅ Read-only | No edit, guide only |

**Rule:** App remains primary daily driver. Web is for practical desktop actions.

### What is editable from web:
- Budget CRUD
- Guests RSVP/notes/dietary
- Profile: date/budget/ceremony/style/size
- Checklist: add/edit/delete/toggle task user-created
- Checklist: deterministic suggestions (click-to-add, no AI)

### What remains app-primary/app-only:
- city/region
- partner names
- documents edit
- vendors full management
- chat complete
- notifications
- smart checklist AI (LLM-based)

---

## Web Vendor Area — Current State

| Feature | Status |
|---|---|
| Vendor portal login | ✅ Live |
| Dashboard 4 tabs | ✅ Live |
| Messages with engagement status | ✅ Live |
| Availability management | ✅ Live |
| Stats (pipeline counts) | ✅ Live |
| Milestones | ❌ Not on web (app only) |
| Reminder | ❌ Not on web (app only) |

---

## Email / Invite Status

| Feature | Status | Notes |
|---|---|---|
| Edge function `send-vendor-invite` | ✅ Deployed | Uses Resend, requires RESEND_API_KEY |
| Cron job `velo-send-emails` | ✅ Active | 09:00 UTC daily, auguri + review request |
| RESEND_API_KEY | ✅ Added | Supabase Secrets (27/03) |
| Full invite email automation | 🔲 Later | Intentional defer |
| Founding manual invite | ✅ Allowed | Admin panel |

**Rule:** Do NOT claim "email automation complete" if TASK.md contradicts.

---

## Build & Deploy

| Check | Status |
|---|---|
| `npm run build` | ✅ Passes (relevant check for Vercel deploy) |
| `npx tsc --noEmit` | standalone may fail due to `.next/types/**/*.ts` config issues; NOT a product blocker |
| Vercel autodeploy | ✅ From main |
| Supabase imports | ✅ Relative paths, no `@/` alias |

---

## Legacy / Historical Documents

The following documents are **HISTORICAL / SUPERSEDED**:
- `docs/superpowers/plans/2026-04-30-web-couple-crud.md`
- `docs/superpowers/specs/2026-04-28-couple-web-dashboard-design.md`
- `docs/superpowers/plans/2026-04-28-couple-web-dashboard.md`
- `HANDOFF_CLAUDE_CODE.md` (pre-web-expansion state)

Current canonical state is in this file (`VELO_CURRENT_STATE.md`).

---

## Encoding note

The following historical files may contain mojibake/encoding issues (es. `ð·ï¸`, `ð¬`):
- `docs/superpowers/plans/2026-04-30-web-couple-crud.md`
- `docs/superpowers/specs/2026-04-28-couple-web-dashboard-design.md`
- `docs/superpowers/plans/2026-04-28-couple-web-dashboard.md`
- `HANDOFF_CLAUDE_CODE.md` (pre-web-expansion state)
- `BACKLOG.md`, `TASK.md`, `CONTEXT.md`

These are marked as **STORICO / SUPERSEDED**. The canonical current state is this file (`VELO_CURRENT_STATE.md`).
Encoding cleanup is deferred to a future maintenance pass.

---

## Working Tree Hygiene Report

**Git status (as of last update):**
```
## main...origin/main [ahead 1]
?? .superpowers/
?? "VELO Homepage Directions - Standalone.html"
?? "VELO Homepage.html"
?? public/images/home/hero-langhe-01.png
?? tsconfig.tsbuildinfo
```

**A. Tracked docs:**
- `VELO_CURRENT_STATE.md` — canonical state document (actively updated)
- `BACKLOG.md`, `TASK.md`, `CONTEXT.md` — **HISTORICAL / SUPERSEDED** (do NOT update unless minimal note needed)
- `HANDOFF_CLAUDE_CODE.md` — **HISTORICAL** (pre-web-expansion state)

**B. Tracked product code:**
- `app/page.tsx` — homepage (light editorial, updated)
- `app/fornitori/page.tsx` — vendor listing (light editorial, updated)
- `app/fornitori/[id]/page.tsx` — vendor detail (light editorial, updated)
- `components/PhotoLightbox.tsx` — photo gallery (locale prop added, updated)
- `components/NavBar.tsx`, `components/SimpleNav.tsx` — navigation (coherent with public site)
- `lib/translations.ts` — copy fixes (updated)
- `app/couple/*` — couple area (NOT touched in recent sprints)
- `app/vendor/*` — vendor admin (NOT touched)

**C. Untracked temporary/artifact:**
- `.superpowers/` — documentation artifacts (do NOT commit)
- `VELO Homepage Directions - Standalone.html` — standalone HTML (do NOT commit)
- `VELO Homepage.html` — standalone HTML (do NOT commit)
- `public/images/home/hero-langhe-01.png` — asset (decide before committing)
- `tsconfig.tsbuildinfo` — TypeScript cache (do NOT commit)

**D. Safe to delete later (not now):**
- `.superpowers/` (after verification)
- `VELO Homepage*.html` (after verification)
- `tsconfig.tsbuildinfo` (safe to delete anytime)

**E. Needs decision:**
- `public/images/home/hero-langhe-01.png` — verify if used before deciding

**Rules:**
- Do NOT commit `.superpowers/` or standalone HTML files
- Do NOT commit `tsconfig.tsbuildinfo`
- Do NOT commit `hero-langhe-01.png` unless confirmed used
- Do NOT use `git add -A`
- Homepage/layout/couple dashboard changes only when explicitly instructed

---

*Last updated: 2 May 2026*
