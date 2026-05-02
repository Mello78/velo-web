# VELO — Current State (Web Repo)

> **Canonical document for web repo state**
> Created: 30 April 2026
> Updated: 2 May 2026 (post Smart Checklist Suggestions CLOSED + LIVE)

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

*Last updated: 2 May 2026*
