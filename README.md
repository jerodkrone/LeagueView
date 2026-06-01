# LeagueView

A dashboard for parents of junior hockey players showing which teams have the most roster openings next season — ranked by active players aging out of eligibility.

## What it does

LeagueView fetches live roster and stats data from a configurable league API, identifies players in their final year of eligibility (turning 21 by Dec 31 of the season's start year), and ranks all teams by how many spots are likely to open up. The goal: help families decide which $400 development camps are worth attending.

## How the ranking works

- **Aging out** — active players (≥1 game played) in their last eligible season. These spots open next year.
- **Returning** — active players still eligible next season (informational).
- Teams are ranked descending by `aging_out_total`. Teams with zero aging-out players are hidden.
- Position breakdown: **F** (forward), **D** (defense), **G** (goalie).

## Project structure

```
LeagueView/
  web/                  React + Vite frontend
  .github/
    workflows/
      deploy.yml        Build + deploy web/ to GitHub Pages on push to master
```

The data pipeline is in a separate private repository. It runs weekly and commits
`ushl.gaps.json` and `nahl.gaps.json` to the `data` branch here.

## Data format

JSON files on the `data` branch:
- `ushl.gaps.json` — USHL teams
- `nahl.gaps.json` — NAHL teams

Each file shape: `{ scraped_at, league_name, season, teams: [...] }`
Each team: `{ team_id, team_name, aging_out: {F,D,G}, returning: {F,D,G}, aging_out_total, returning_total }`

## Frontend

React + Vite app in `web/`. Reads `gaps.json` at runtime and renders a ranked card grid.

```bash
cd web
npm install
npm run dev       # local dev server
npm run build     # production build → web/dist/
```

## Deployment

GitHub Actions handles everything automatically:

| Workflow | Trigger | What it does |
|---|---|---|
| `deploy.yml` | Push to `master` | Fetches latest JSON from `data` branch, builds `web/`, deploys to GitHub Pages |

The `data` branch holds only the gap JSON files to keep `master` history clean.
