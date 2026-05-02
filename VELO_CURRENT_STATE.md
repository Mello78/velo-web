# VELO — Current State (Web Repo)

> **Canonical document for web repo state**
> Created: 30 April 2026
> Updated: 2 May 2026 (post Profile + Checklist Light sprint closed)

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
- NO risk of duplicate rows

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
- Budget/guests update/delete filter by `id` only
- Full security depends on Supabase RLS
- To be reviewed in future (Privacy/RLS tightening)
- Does NOT block this sprint

---

## WEB COUPLE COMPLETION — Profile + Checklist Light

**Status:** ✅ CLOSED + LIVE
**Commit:** `2053ab7` — final checklist microfix / profile + checklist light sprint
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
| `app/couple/checklist/page.tsx` | ✅ Add / edit / delete / toggle | user-created tasks only; no smart suggestions |
| `app/couple/documents/page.tsx` | ✅ Read-only | No edit, guide only |

**Rule:** App remains primary daily driver. Web is for practical desktop actions.

### What is editable from web:
- Budget CRUD
- Guests RSVP/notes/dietary
- Profile: date/budget/ceremony/style/size
- Checklist: add/edit/delete/toggle task user-created

### What remains app-primary/app-only:
- city/region
- partner names
- documents edit
- vendors full management
- chat complete
- notifications
- smart checklist AI

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
