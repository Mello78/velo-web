# VELO Design System Rollout

## Core visual system

- Surfaces:
  - `--velo-paper`: homepage / shell parchment base
  - `--velo-paper-2`: lighter cream for elevated surfaces
  - `--velo-paper-3`: warmer section contrast
  - `--velo-card`: primary product card surface
- Contrast:
  - `--velo-espresso`: selective dark object / premium contrast
  - `--velo-sidebar`: darker product navigation object
  - `--velo-ink`: primary dark text
- Accents:
  - `--velo-terracotta`: primary CTA / emphasis / progress
  - `--velo-terracotta-deep`: hover / pressed CTA
  - `--velo-success`, `--velo-danger`, `--velo-info`: product-state accents
- Borders and secondary text:
  - `--velo-border`
  - `--velo-border-strong`
  - `--velo-muted`
  - `--velo-muted-soft`

## Typography rules

- Display serif:
  - `DM Serif Display` for page titles, key numbers, and emotional product headings
- Editorial italic:
  - `Fraunces italic` reserved for poetic or manifesto moments
- UI / metadata:
  - system sans for controls, body copy, navigation, and dense product text
- Utility mono:
  - `JetBrains Mono` for kickers, pills, timestamps, and product metadata

## Spacing and surface rules

- Page intros:
  - short mono kicker
  - large serif title
  - restrained supporting line
- Product pages:
  - prefer grouped surfaces over loose floating cards
  - use 16-24px internal padding for dense cards
  - use 20-24px gaps between major blocks
- Dark contrast:
  - reserve for shell/sidebar, highlighted overview objects, and selective high-contrast moments
  - do not default whole authenticated pages to dark

## Component patterns

- `CouplePageIntro`: shared authenticated-page heading structure
- `CouplePanel`: primary paper / soft / dark surface wrapper
- `CoupleNotice`: warning, error, neutral, and success notice block
- `CoupleMetricCard`: compact metric summary card
- `CoupleChip`: pill/filter/tag system
- `CoupleEmptyState`: quiet empty-state block
- `CoupleLoadingBlock`: shared loading state

## Copy tone rules

- Couple-first
- calm, precise, and helpful
- fewer dashboard/admin phrases
- present VELO as one planning environment, not disconnected tools
- use Italy / destination logic where it helps comprehension, not as decoration

## App rollout preparation

### Directly portable to app

- color roles and accents
- serif + sans hierarchy
- kicker / label treatment
- calmer card hierarchy
- terracotta CTA logic
- parchment-led background rhythm

### Needs mobile adaptation

- sidebar contrast becomes top-level tab / section framing
- wide intro layouts become stacked intro blocks
- dense grouped cards should collapse into tighter vertical sections
- editorial breathing room should be reduced, not removed

### Recommended app rollout order

1. Home
2. Vendors
3. Planning
4. Documents
5. Profile / onboarding-adjacent surfaces
6. Shared chips, notices, cards, and empty states
