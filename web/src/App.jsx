import { useEffect, useState } from 'react'
import './App.css'

const LEAGUES = [
  { key: 'ushl', label: 'USHL', url: './ushl.gaps.json' },
  { key: 'nahl', label: 'NAHL', url: './nahl.gaps.json' },
]

const POSITIONS = [
  { key: 'all', label: 'All' },
  { key: 'F', label: 'Forward' },
  { key: 'D', label: 'Defense' },
  { key: 'G', label: 'Goalie' },
]

function PositionPips({ counts, type }) {
  const color = type === 'aging' ? '#f97316' : '#38bdf8'
  const items = []
  for (let i = 0; i < counts.F; i++) items.push({ pos: 'F', color })
  for (let i = 0; i < counts.D; i++) items.push({ pos: 'D', color })
  for (let i = 0; i < counts.G; i++) items.push({ pos: 'G', color })
  return (
    <div className="pips">
      {items.map((p, i) => (
        <span key={i} className="pip" style={{ background: p.color }} title={p.pos}>
          {p.pos}
        </span>
      ))}
    </div>
  )
}

function TeamCard({ team, rank }) {
  return (
    <div className="card">
      <div className="card-rank">#{rank}</div>
      <div className="card-body">
        <div className="card-name">{team.team_name}</div>

        <div className="card-section">
          <div className="card-label">Aging out</div>
          <div className="card-count aging">{team.aging_out_total}</div>
          <PositionPips counts={team.aging_out} type="aging" />
        </div>

        <div className="card-section">
          <div className="card-label">Returning</div>
          <div className="card-count returning">{team.returning_total}</div>
          <PositionPips counts={team.returning} type="returning" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ position, onClear }) {
  const icon = position === 'G' ? '🥅' : '🏒'
  const label = { F: 'Forward', D: 'Defense', G: 'Goalie' }[position]
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p className="empty-heading">No {label} spots opening this season</p>
      <p className="empty-sub">Try a different position or switch leagues</p>
      <button className="empty-clear" onClick={onClear}>Show all positions</button>
    </div>
  )
}

export default function App() {
  const [league, setLeague] = useState(LEAGUES[0])
  const [pos, setPos] = useState(POSITIONS[0])
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    fetch(league.url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((d) => { if (!ignore) { setData(d); setLoading(false) } })
      .catch((e) => { if (!ignore) { setError(e.message); setLoading(false) } })
    return () => { ignore = true }
  }, [league])

  function switchLeague(l) {
    setLeague(l)
    setPos(POSITIONS[0])
  }

  if (error) return <div className="state-msg">Failed to load data: {error}</div>
  if (!data) return <div className="state-msg">Loading…</div>

  const scraped = new Date(data.scraped_at)
  const scrapeLabel = scraped.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  const sorted = [...data.teams]
    .filter((t) => pos.key === 'all' || t.aging_out[pos.key] > 0)
    .sort((a, b) =>
      pos.key === 'all'
        ? b.aging_out_total - a.aging_out_total
        : b.aging_out[pos.key] - a.aging_out[pos.key]
    )

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div>
            <h1 className="logo">LeagueView</h1>
            <p className="tagline">{data.league_name} roster gaps · {data.season} season</p>
          </div>
          <div className="freshness">
            <span className="freshness-dot" />
            Updated {scrapeLabel}
          </div>
        </div>

        <div className="league-tabs" role="tablist">
          {LEAGUES.map((l) => (
            <button
              key={l.key}
              role="tab"
              aria-selected={league.key === l.key}
              className="league-tab"
              onClick={() => switchLeague(l)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <p className="explainer">
          Teams ranked by active players aging out of eligibility — the most open
          spots for camp attendees next season. <strong>F</strong> = forward,{' '}
          <strong>D</strong> = defense, <strong>G</strong> = goalie.
        </p>
      </header>

      <div className="pos-filter" role="group" aria-label="Filter by position">
        {POSITIONS.map((p_) => (
          <button
            key={p_.key}
            className="pos-pill"
            aria-pressed={pos.key === p_.key}
            onClick={() => setPos(p_)}
          >
            {p_.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 && pos.key !== 'all' ? (
        <EmptyState position={pos.key} onClear={() => setPos(POSITIONS[0])} />
      ) : (
        <main className="grid" style={{ opacity: loading ? 0.4 : 1 }}>
          {sorted.map((team, i) => (
            <TeamCard key={team.team_id} team={team} rank={i + 1} />
          ))}
        </main>
      )}

      <footer className="footer">
        Data sourced from {data.league_name} league API · not affiliated with {data.league_name}
      </footer>
    </div>
  )
}
