# VELO — Current State (Web Repo)

> **Canonical document for web repo state**
> Created: 30 April 2026
> Updated: 30 April 2026 (post Web Couple Expansion — Practical Actions v1)

---

## WEB COUPLE EXPANSION — Practical Actions v1

**Status:** ✅ CLOSED

**Commit:** `a761a4c` — fix: uniform couple resolver + accurate web copy across /couple area

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
- `npm run build` — ✅ passes
- `npx tsc --noEmit` — ✅ passes
- Codex final verify: ✅ CLOSED

### Non-blocking residue:
- Budget/guests update/delete filter by `id` only
- Full security depends on Supabase RLS
- To be reviewed in future (Privacy/RLS tightening)
- Does NOT block this sprint

---

## Web Couple Area — Current Ownership

| Page | Status | Notes |
|---|---|---|
| `app/couple/dashboard/page.tsx` | ✅ Live | Countdown, next step, overview |
| `app/couple/profile/page.tsx` | ✅ Partial edit | date, budget, ceremony; location NOT yet editable |
| `app/couple/budget/page.tsx` | ✅ CRUD live | add/edit/delete expense, toggle confirmed |
| `app/couple/guests/page.tsx` | ✅ RSVP + notes/dietary live | NOT email invites, NOT table planner |
| `app/couple/vendors/page.tsx` | ✅ Read-only | Pipeline view, no edit |
| `app/couple/checklist/page.tsx` | ✅ Partial | Phases toggle, no smart suggestions yet |
| `app/couple/documents/page.tsx` | ✅ Read-only | No edit, guide only |

**Rule:** App remains primary daily driver. Web is for practical desktop actions.

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
| `npm run build` | ✅ Passes |
| `npx tsc --noEmit` | ✅ Passes |
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

*Last updated: 30 April 2026*
