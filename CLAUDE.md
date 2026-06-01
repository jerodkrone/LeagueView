# LeagueView — Claude Code Instructions

## Project Overview

LeagueView is a GitHub Pages dashboard for parents of junior hockey players. It shows
which USHL and NAHL teams have the most roster openings next season, ranked by active
players aging out of eligibility.

## Project Structure

```
web/                React + Vite frontend
  src/App.jsx       Main app — league tabs, position filter, card grid
  src/App.css       All styles
  public/           Static assets + local dev data files
.github/workflows/
  deploy.yml        Build + deploy web/ to GitHub Pages on push to master
```

Data pipeline lives in the private repo: github.com/jerodkrone/leagueview-pipeline
The pipeline runs weekly and pushes ushl.gaps.json + nahl.gaps.json to the `data` branch here.

## Branch & PR Workflow

**All work happens on feature branches. Nothing goes directly to master.**

```bash
# Start any new feature
git checkout -b feat/your-feature-name

# When done, push and open a PR
git push -u origin feat/your-feature-name
gh pr create --title "..." --body "..."
```

Branch naming:
- `feat/` — new features (e.g. `feat/ncdc-league`, `feat/birth-year-filter`)
- `fix/` — bug fixes
- `chore/` — CI, deps, config changes

PR checklist before merging:
- [ ] `cd web && npm run build` passes (no type/lint errors)
- [ ] Manually verified in `npm run dev` if frontend changed
- [ ] Plan reviewed (`/plan-eng-review`) for anything touching architecture

Merge via squash on GitHub (keeps master history clean) or `gh pr merge --squash`.

## Testing

```bash
cd web && npm run lint            # ESLint
cd web && npm run build           # Production build check
```

No E2E test suite yet. Manual verification via `cd web && npm run dev`.

## Data Format

JSON files fetched from the `data` branch at deploy time:
- `ushl.gaps.json` — USHL teams
- `nahl.gaps.json` — NAHL teams

Output shape: `{ scraped_at, league_name, season, teams: [...] }`
Each team: `{ team_id, team_name, aging_out: {F,D,G}, returning: {F,D,G}, aging_out_total, returning_total }`

## Skill Routing

When the user's request matches an available skill, invoke it via the Skill tool.

Key routing rules:
- Product ideas / brainstorming → invoke /office-hours
- Strategy / scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system / plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs / errors → invoke /investigate
- QA / testing site behavior → invoke /qa or /qa-only
- Code review / diff check → invoke /review
- Visual polish → invoke /design-review
- Ship / deploy / PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
