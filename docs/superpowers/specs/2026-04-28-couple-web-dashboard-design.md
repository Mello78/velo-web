# Couple Web Dashboard — Design Spec

**Date:** 2026-04-28
**Status:** Approved
**Scope:** velo-web-temp only. No mobile app changes. No schema/RLS changes.

---

## 1. Goal

Transform `/couple/dashboard` from a minimal countdown + metric overview into a real wedding hub. A couple opening the dashboard must understand within 10 seconds:

1. How many days until the wedding
2. What to do next
3. Document status
4. Vendor pipeline
5. Guest count and RSVP
6. Budget progress
7. Checklist progress

---

## 2. File Changes

| File | Change |
|---|---|
| `app/couple/dashboard/page.tsx` | Full rewrite (~500 lines) |
| `components/couple-ui.tsx` | Add 5 small components at the bottom |
| `lib/translations.ts` | Extend `couple.dashboard` with ~30 new keys (IT + EN) |

**No other files touched.** Existing couple pages are not modified.

---

## 3. Architecture

### Pattern
Follows the existing couple pages pattern:
- `'use client'` single page component
- Local `useState` / `useEffect` for data
- Locale resolved via `getCoupleLocale()` + `getPreferredSiteLocale()`
- All text from `lib/translations.ts` (accessed via `getT(locale)`)

### Data fetch (two rounds)
**Round 1 — session + locale:**
```
supabase.auth.getSession()
→ supabase.from('couples').select(full row)
→ resolve locale, setLocale
```

**Round 2 — Promise.all (parallel):**
```
engagements: id, vendor_id, status  (eq user_id)
tasks:       id, title, urgent, completed, phase  (eq user_id)
guests:      id, rsvp, plus_one  (eq user_id)
expenses:    id, amount, confirmed  (eq user_id)
vendors:     id, name, category  (eq user_id)  — for agreed-vendor name lookup
```

The `vendors` table here is the user's saved vendors table (not `public_vendors`, not `vendor_accounts`).
Pipeline state comes from `engagements.status` exclusively.
Vendor name lookup: `engagements.find(e => e.status === 'agreed')?.vendor_id` → `vendors.find(v => v.id === that_id)?.name`.

### Layout (desktop)
```
HeroPanel           (full width)
NextStepPanel       (full width)
grid lg:grid-cols-2:
  [DocumentsSection | VendorsSection ]
  [GuestsSection    | BudgetSection  ]
ChecklistSection    (full width)
```
Mobile: single column (grid stacks naturally).

---

## 4. Section Specs

### 4.1 Hero

**Container:** `CouplePanel tone="dark"` full-width, with decorative rings (keep current style).

**Content:**
- Eyebrow: `partner1 & partner2` (mono, terracotta)
- Countdown: large display number (4.8rem, font-light) when `wedding_date` set
- Unit label: `t.couple.dashboard.days`
- Date line: formatted date (`en-GB` / `it-IT` per locale)
- Location line: `wedding_city` + `wedding_region` — fallback `t.couple.dashboard.locationMissing` if both null
- Ceremony badge: small pill — civil / religious / symbolic / `t.couple.dashboard.ceremonyTbd` if null
- Progress pill: `X% ${t.couple.dashboard.progressComplete}` — computed from tasks (`completedTasks / totalTasks * 100`, capped 100%)

**Fallback (no date):**
`CoupleNotice` inside the dark panel (keep current pattern). Text: `t.couple.dashboard.heroDateMissing`.

**Guard:** never show `0` as the countdown number. If `days <= 0` show `0` but accompany with past-date notice.

---

### 4.2 Next Step

**Container:** `CouplePanel tone="soft"` full-width.

**Priority chain** (evaluated from already-fetched data, client-side):

| Priority | Condition | i18n key | href |
|---|---|---|---|
| A | `engagements.some(e => e.status === 'agreed')` | `nextStepAgreed` (interpolated with vendor name) | `/couple/vendors` |
| B | `couple.ceremony_type == null` | `nextStepCeremony` | `/couple/profile` |
| C | `couple.wedding_date == null` | `nextStepDate` | `/couple/profile` |
| D | `isForeign && engagements.length === 0` | `nextStepDocs` | `/couple/documents` |
| E | `engagements.length === 0` | `nextStepVendors` | `/couple/vendors` |
| F | first `urgent && !completed` task exists | task title (raw) | `/couple/checklist` |
| G | fallback | `nextStepChecklist` | `/couple/checklist` |

**Rendering:**
- Eyebrow: `t.couple.dashboard.nextStepTitle` (uppercase mono, terracotta)
- Main text: resolved label (display font, ~1.6rem)
- CTA link: arrow + href (underline on hover, terracotta)

---

### 4.3 Documents Section

**Visibility:** shown to ALL couples. Content adapts by mode.

**Mode detection:**
```
isForeign  = nationality === 'foreign' || (country_of_origin && country_of_origin !== 'IT')
isSymbolic = ceremony_type === 'symbolic'
countryDoc = COUNTRIES.find(c => c.code === country_of_origin) ?? null
```

**Status badge (small pill above title):**
- `countryDoc` present → `t.couple.dashboard.documentsPersonalized`
- `nationality` set but no match → `t.couple.dashboard.documentsFallback`
- No nationality/country set → `t.couple.dashboard.documentsCompleteProfile`

**Italian couple:** `CoupleNotice tone="neutral"` with copy:
- IT: "Documenti e promemoria saranno adattati al tipo di cerimonia e alla località."
- EN: "Documents and reminders adapt to your ceremony type and location."
Keys: `t.couple.dashboard.documentsItalianText`

**Symbolic ceremony:** `CoupleNotice tone="neutral"` with `t.couple.dashboard.documentsSymbolicTitle` + `t.couple.dashboard.documentsSymbolicText`. No bureaucratic copy. Reassuring tone: a symbolic ceremony does not require Italian legal documents to be celebrated. If legal validity is needed, a separate civil ceremony is required.

**Foreign couple — 3 mini cards** (only if `countryDoc`):
- Main document → `countryDoc.keyDoc`
- Where to get it → `countryDoc.steps[0]` (first step, truncated to ~80 chars with `…`)
- When to arrive → `countryDoc.arrivalDays`

Use three small `CouplePanel tone="soft"` cards in a `grid grid-cols-3` (stacks to 1 col on mobile). No new component needed.

**Urgency banner** (only if not symbolic and `wedding_date` set):
- `days < 60` → `CoupleNotice tone="danger"` + `t.couple.dashboard.documentsUrgent`
- `days 60–120` → `CoupleNotice tone="warning"` + `t.couple.dashboard.documentsEarly`
- `days > 120` → no banner

**CTA:** `→ /couple/documents` — `t.couple.dashboard.documentsCta`

---

### 4.4 Vendors Section

**Data:** `engagements` (already fetched) + `vendors` (name, category).

**Pipeline pills** (only statuses with count > 0):
- statuses: `booked`, `agreed`, `quote_sent`, `lead`
- Use `CoupleStatusPill` (new component) per status with count

**Vendor rows** (max 3):
- Sort by: `['booked', 'agreed', 'quote_sent', 'lead', 'completed', 'cancelled']`
- Per row: name (from vendors table via vendor_id), category, `CoupleStatusPill`
- If vendor name not found in vendors table: show "—"

**Empty state:** `engagements.length === 0` → `CoupleEmptyState` with `t.couple.dashboard.vendorsEmpty`

**Read-only strip:** `CoupleReadOnlyNotice` (new) with `t.couple.dashboard.vendorsReadOnly`

**CTA:** `→ /couple/vendors` — `t.couple.dashboard.vendorsCta`

---

### 4.5 Guests Section

**Data:** `guests` rows (id, rsvp, plus_one) — already fetched.

**Computed:**
```
total     = guests.length
confirmed = guests.filter(g => g.rsvp === 'confirmed').length
pending   = guests.filter(g => !g.rsvp || g.rsvp === 'pending').length
declined  = guests.filter(g => g.rsvp === 'declined').length
seats     = total + guests.filter(g => g.plus_one).length
```

**Metric row:**
- `CoupleMetricCard` (existing) for total guests — accent terracotta
- Inline stats: confirmed (success) / pending (muted) / declined (danger) — smaller inline layout

**RSVP bar:** `CoupleRsvpBar` (new component). Three segments: confirmed/pending/declined, proportional widths. Zero total → bar hidden.

**Seats line:** `seats` total including plus_ones — `t.couple.dashboard.guestsSeats`

**Empty state:** total === 0 → simple placeholder text

**Read-only strip:** `CoupleReadOnlyNotice` with `t.couple.dashboard.guestsReadOnly`

**CTA:** `→ /couple/guests` — `t.couple.dashboard.guestsCta`

---

### 4.6 Budget Section

**Data:** `expenses` (already fetched) + `couples.budget` (from couples row).

**Computed:**
```
planned   = couples.budget (null-safe)
confirmed = expenses.filter(e => e.confirmed).reduce(sum, e.amount)
pct       = planned > 0 ? Math.min(100, confirmed / planned * 100) : 0
```

**Progress bar:** `CoupleProgressBar` (new) — thin (5px), fill terracotta, >100% fill danger color.

**Metrics:**
- Planned budget: formatted currency or `—` if null
- Confirmed: formatted currency

**Fallback:** `couples.budget == null` → `CoupleNotice tone="neutral"` with `t.couple.dashboard.budgetNotSet` instead of bar

**Read-only strip:** `CoupleReadOnlyNotice` with `t.couple.dashboard.budgetReadOnly`

**CTA:** `→ /couple/budget` — `t.couple.dashboard.budgetCta`

---

### 4.7 Checklist Section

**Data:** `tasks` (already fetched).

**Computed:**
```
total     = tasks.length
completed = tasks.filter(t => t.completed).length
pct       = total > 0 ? Math.round(completed / total * 100) : 0
urgent    = tasks.filter(t => t.urgent && !t.completed).slice(0, 3)
```

**Rendering:**
- `CoupleProgressBar` showing `pct`
- Counter: `X / Y ${t.couple.dashboard.checklistCompleted}`
- Urgent task rows (max 3): task title (title_it / title_en per locale if available, else title) + "urgent" pill
- Empty state (total === 0): `t.couple.dashboard.noUrgentTasks`

**CTA:** `→ /couple/checklist` — `t.couple.dashboard.checklistCta`

---

## 5. New Components (couple-ui.tsx)

Added at the bottom of the existing file. No existing exports modified.

### `CoupleSection`
```tsx
props: {
  title: string
  eyebrow?: string
  cta?: { label: string; href: string }
  children: ReactNode
}
```
Renders a `CouplePanel` wrapping children, with an eyebrow + title row and optional right-aligned CTA link.

### `CoupleProgressBar`
```tsx
props: { pct: number; tone?: 'default' | 'danger' }
```
Thin (5px) full-width bar. Fill color: terracotta default, danger if tone='danger'. Smooth transition.

### `CoupleRsvpBar`
```tsx
props: { confirmed: number; pending: number; declined: number; total: number }
```
Three-segment horizontal bar. Each segment width proportional to count/total. Colors: success / muted / danger.

### `CoupleStatusPill`
```tsx
props: { status: 'lead'|'quote_sent'|'agreed'|'booked'|'completed'|'cancelled'; label: string }
```
Reuses the color/bg/border pattern from `STATUS_CONFIG` in vendors page. Does not import STATUS_CONFIG — duplicates the minimal color map inline to avoid coupling.

### `CoupleReadOnlyNotice`
```tsx
props: { text: string }
```
Renders a `<p>` with `text-[10px] uppercase tracking-[0.2em] text-[var(--velo-muted-soft)]` and `fontFamily: VELO_MONO_FONT`. No icon. Placed directly above the CTA in each section.

---

## 6. translations.ts — New Keys

Added under `couple.dashboard` in both `it` and `en` blocks.

```
heroDateMissing      — "Data non ancora impostata" / "Date not set yet"
locationMissing      — "Location da definire" / "Location to define"
ceremonyTbd          — "Rito da definire" / "Ceremony TBD"
progressComplete     — "completato" / "complete"
nextStepTitle        — "Prossimo passo" / "Next step"
nextStepAgreed       — "Conferma {name} per bloccare la data" / "Confirm {name} to lock the date"
nextStepCeremony     — "Completa il tipo di cerimonia" / "Complete your ceremony type"
nextStepDate         — "Imposta la data del matrimonio" / "Set your wedding date"
nextStepDocs         — "Apri la guida documenti" / "Open the document guide"
nextStepVendors      — "Scopri i fornitori" / "Discover vendors"
nextStepChecklist    — "Rivedi la checklist" / "Review your checklist"
documentsTitle       — "Documenti" / "Documents"
documentsCta         — "Apri la guida completa →" / "Open full guide →"
documentsPersonalized— "Personalizzato" / "Personalized"
documentsFallback    — "Guida generica" / "General guide"
documentsCompleteProfile — "Completa il profilo" / "Complete your profile"
documentsItalianText — "Documenti e promemoria saranno adattati al tipo di cerimonia e alla località." / "Documents and reminders adapt to your ceremony type and location."
documentsSymbolicTitle — "Rito simbolico" / "Symbolic ceremony"
documentsSymbolicText— "Il rito simbolico non richiede documenti legali italiani per essere celebrato. Se volete anche la validità legale, è necessario un rito civile separato." / "A symbolic ceremony does not require Italian legal documents to be celebrated. For legal validity, a separate civil ceremony is required."
documentsUrgent      — "Meno di 60 giorni al matrimonio — verifica i documenti adesso." / "Less than 60 days to go — verify your documents now."
documentsEarly       — "Buon momento per avviare la raccolta documenti." / "Good time to start gathering documents."
documentsMainDoc     — "Documento principale" / "Main document"
documentsWhere       — "Dove ottenerlo" / "Where to get it"
documentsWhen        — "Quando muoversi" / "When to move"
vendorsTitle         — "Fornitori" / "Vendors"
vendorsCta           — "Vedi tutti →" / "View all →"
vendorsEmpty         — "Nessun fornitore salvato ancora" / "No vendors saved yet"
vendorsReadOnly      — "Usa l'app VELO per scrivere ai fornitori, salvarli o confermarli" / "Use the VELO app to message vendors, save or confirm them"
guestsTitle          — "Ospiti" / "Guests"
guestsCta            — "Vedi lista →" / "View list →"
guestsReadOnly       — "Usa l'app VELO per aggiungere ospiti o aggiornare gli RSVP" / "Use the VELO app to add guests or update RSVPs"
guestsSeats          — "posti totali (con accompagnatori)" / "total seats (including plus-ones)"
budgetTitle          — "Piano di spesa" / "Spending plan"
budgetCta            — "Vedi dettaglio →" / "View detail →"
budgetReadOnly       — "Usa l'app VELO per aggiungere voci o confermare importi" / "Use the VELO app to add items or confirm amounts"
budgetNotSet         — "Budget non ancora impostato" / "Budget not set yet"
checklistTitle       — "Checklist" / "Checklist"
checklistCta         — "Vedi tutto →" / "View all →"
checklistCompleted   — "completati" / "completed"
noUrgentTasks        — "Nessun task urgente — tutto sotto controllo." / "No urgent tasks — everything is under control."
```

> `nextStepAgreed` uses a `{name}` placeholder. Implementation must interpolate the vendor name string (simple string replace, no i18n library interpolation needed).

---

## 7. Acceptance Criteria

- `/couple/dashboard` loads without errors.
- All 7 sections render.
- User with complete profile sees coherent data.
- User without `wedding_date` never sees `0` as a false countdown.
- Foreign couple sees Documents as a useful, priority block.
- Symbolic ceremony shows reassuring copy — not bureaucratic.
- Zero vendors shows empty state + CTA.
- Budget without value shows useful placeholder.
- Empty guest list shows coherent zeros.
- All new text is in `lib/translations.ts` (IT + EN), accessed via `getT(locale)`.
- `npm run build` passes.
- No existing `/couple/*` page is broken.

---

## 8. Out of Scope

- Chat on web
- Mutation of vendors / guests / budget / expenses from dashboard
- DB schema or RLS changes
- Supabase Edge Function changes
- Mobile app changes
- Push notifications
- Real-time data refresh (no Supabase Realtime subscription)

---

## 9. Risks

- `CountryDoc` fields confirmed: `keyDoc` (main document), `steps[0]` (where to get it, truncate to ~80 chars), `arrivalDays` (when to move).
- `tasks` table may have `title_it` / `title_en` nullable — fall back to `title` always.
- The `vendors` table (user's saved vendors) is distinct from `public_vendors` and `vendor_accounts`. The agreed-vendor name lookup must use the right table (`vendors`, not `public_vendors`).
- `plus_one` on guests may be `boolean | null` — treat `null` as `false`.
- If `engagements` fetch fails, degrade gracefully: hide vendors section with `CoupleNotice tone="warning"`.
