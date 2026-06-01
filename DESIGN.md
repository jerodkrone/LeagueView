# Design System — LeagueView

## Product Context
- **What this is:** A data dashboard showing which junior hockey teams have the most roster openings next season, ranked by players aging out of eligibility.
- **Who it's for:** Hockey parents making real financial decisions — which $400 development camps are worth attending.
- **Space/industry:** Junior hockey data; peers are EliteProspects, Next1Hockey, USHR. All built for scouts/coaches, not parents.
- **Project type:** Dark-first data dashboard / GitHub Pages static site.
- **Memorable thing:** "The serious tool hockey parents actually deserve." Credible data, not clinical. Warm enough that a parent feels helped, not overwhelmed.

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian with one warm edge
- **Decoration level:** Minimal — typography and spacing carry all the weight. No gradients, no textures, no decorative shapes.
- **Mood:** The product feels like a well-made tool: purposeful, fast to scan, honest about the data. The orange accent is the warmth. Everything else is disciplined.
- **Differentiation:** Every competitor uses system fonts or Inter and a single accent. LeagueView uses DM Sans (warmer and more approachable than the category norm) and two semantic accent colors that map directly to the product's core concept.

## Typography
- **Display/Logo:** DM Sans 800 — the LeagueView wordmark and team names
- **Body/UI:** DM Sans 400 — explainer text, labels, footer copy
- **UI Labels:** DM Sans 600 — tab labels, filter pills, card section headers
- **Data/Counts:** DM Sans 700 with `font-variant-numeric: tabular-nums` — aging-out and returning counts stay pixel-aligned as data changes
- **Code:** (none used in UI)
- **Loading:** Google Fonts CDN
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet">
  ```
- **Scale:**
  | Role | Size | Weight |
  |------|------|--------|
  | Logo | 1.75rem | 800 |
  | Team name | 1rem | 600 |
  | Count | 1.1rem | 700 |
  | Body / explainer | 0.875rem | 400 |
  | Tab label | 0.875rem | 600 |
  | Card label (uppercase) | 0.72rem | 600 |
  | Pip badge | 0.6rem | 700 |
  | Footer | 0.75rem | 400 |

## Color
- **Approach:** Restrained — two semantic accents, the rest are neutrals. Color is rare and meaningful.

```css
:root {
  /* Surfaces */
  --bg:           #0f1117;   /* page background */
  --surface:      #161b27;   /* card background */

  /* Borders */
  --border:       #1e2535;   /* default border */
  --border-hover: #334155;   /* hover / active border */

  /* Text hierarchy */
  --text-primary:   #f1f5f9; /* headings, team names, active labels */
  --text-secondary: #94a3b8; /* explainer text */
  --text-muted:     #64748b; /* tagline, freshness, secondary meta */
  --text-faint:     #475569; /* rank numbers, inactive labels */

  /* Semantic accents */
  --accent-orange: #f97316;  /* aging out — urgency, scarcity */
  --accent-blue:   #38bdf8;  /* returning — stability, continuity */
  --accent-green:  #22c55e;  /* freshness dot only */
}
```

- **Semantic rules:**
  - Orange is for aging-out players only. Do not reuse for other UI elements.
  - Blue is for returning players only. Do not reuse for other UI elements.
  - Green is for the freshness/live indicator only.
  - The active tab underline uses orange — the only exception, intentional: it ties the navigation to the data.

## Spacing
- **Base unit:** 4px
- **Practical unit:** 8px (most spacing multiples of 8)
- **Scale:**

  | Token | Value |
  |-------|-------|
  | 2xs | 4px |
  | xs | 8px |
  | sm | 12px |
  | md | 16px |
  | lg | 24px |
  | xl | 32px |
  | 2xl | 48px |
  | 3xl | 64px |

## Layout
- **Approach:** Grid-disciplined. This is a data tool; no creative-editorial layouts.
- **Grid:** `auto-fill, minmax(280px, 1fr)` — responsive without breakpoints
- **Max content width:** 960px centered
- **Mobile:** Cards go single-column below ~480px; position pills stack to 44px touch targets

## Border Radius (hierarchical)
| Element | Radius |
|---------|--------|
| Pip badges | 3px |
| Position filter pills | 6px |
| Cards | 10px |
| Empty-state button | 8px |

Do not apply uniform border-radius across all elements. The hierarchy is intentional: small elements are sharper, larger containers are softer.

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension.
- **Easing:** ease-out for all transitions
- **Duration:** 150ms for color/border changes; 200ms for opacity fades (grid loading state)
- **What animates:** `border-color`, `color`, `opacity` only
- **What does not animate:** layout, size, position, entrance/exit

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-31 | DM Sans over Geist | Warmer and more approachable for a parent audience; both support tabular-nums. Geist was sharper but DM Sans fits the human tone better. |
| 2026-05-31 | Two semantic accent colors (orange + blue) | Maps directly to the product's core concept: spots opening vs. spots filled. Most dashboards use one accent — this is a deliberate departure. |
| 2026-05-31 | Rank numbers styled as muted (#475569) | Parents scan by team name, not rank number. The name is the hero. |
| 2026-05-31 | Minimal decoration | Every hockey data competitor is cluttered. Restraint is the differentiator. |
| 2026-05-31 | Initial design system created | /design-consultation based on codebase audit + competitive research (EliteProspects, Next1Hockey, USHR, RinkNet, Sportlogiq) |
