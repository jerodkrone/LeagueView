import { useEffect, useMemo, useState } from 'react'
import './App.css'

const LEAGUES = [
  { key: 'nahl', label: 'NAHL', url: './nahl.gaps.json' },
  { key: 'ushl', label: 'USHL', url: './ushl.gaps.json' },
]

const POSITIONS = [
  { key: 'all', label: 'All' },
  { key: 'F', label: 'Forward' },
  { key: 'D', label: 'Defense' },
  { key: 'G', label: 'Goalie' },
]

// Resolves aging counts for sort and card display.
// Always returns { count: number, counts: {F,D,G} }.
//
//  birthYear='all'  → counts = team.aging_out F/D/G totals
//  birthYear='2009' → counts = by_year['2009'] ?? {F:0,D:0,G:0}
//
//  count = sum(counts) if posKey='all', else counts[posKey]
export function getAgingInfo(team, birthYear, posKey) {
  const raw = birthYear !== 'all'
    ? (team.aging_out.by_year?.[birthYear] ?? { F: 0, D: 0, G: 0 })
    : { F: team.aging_out.F, D: team.aging_out.D, G: team.aging_out.G }
  const count = posKey === 'all'
    ? (raw.F + raw.D + raw.G)
    : (raw[posKey] ?? 0)
  return { count, counts: raw }
}

// Derives available birth years from loaded data.
// Returns ['all', ...sortedYears] where years come from aging_out.by_year keys.
export function deriveAvailableYears(teams) {
  const years = new Set()
  teams.forEach((t) => Object.keys(t.aging_out.by_year || {}).forEach((y) => years.add(y)))
  return ['all', ...Array.from(years).sort()]
}

function PositionPips({ counts, type, posKey }) {
  const color = type === 'aging' ? '#f97316' : '#38bdf8'
  const items = []
  for (let i = 0; i < counts.F; i++) items.push({ pos: 'F' })
  for (let i = 0; i < counts.D; i++) items.push({ pos: 'D' })
  for (let i = 0; i < counts.G; i++) items.push({ pos: 'G' })
  return (
    <div className="pips">
      {items.map((p, i) => {
        const active = posKey === 'all' || posKey === p.pos
        return (
          <span
            key={i}
            className="pip"
            style={{ background: active ? color : '#374151' }}
            title={p.pos}
          >
            {p.pos}
          </span>
        )
      })}
    </div>
  )
}

function TeamCard({ team, rank, posKey, agingCount, agingCounts }) {
  const returnCount = posKey === 'all' ? team.returning_total : team.returning[posKey]
  return (
    <div className="card">
      <div className="card-rank">#{rank}</div>
      <div className="card-body">
        <div className="card-name">{team.team_name}</div>

        <div className="card-section">
          <div className="card-label">Aging out</div>
          <div className="card-count aging">{agingCount}</div>
          <PositionPips counts={agingCounts} type="aging" posKey={posKey} />
        </div>

        <div className="card-section">
          <div className="card-label">Returning</div>
          <div className="card-count returning">{returnCount}</div>
          <PositionPips counts={team.returning} type="returning" posKey={posKey} />
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
  const [birthYear, setBirthYear] = useState(
    () => localStorage.getItem('leagueview-birth-year') || 'all'
  )
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [byYearMissing, setByYearMissing] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    fetch(league.url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((d) => {
        if (!ignore) {
          setData(d)
          setLoading(false)
          // D6: if user had a birth year saved but data lacks by_year, reset
          if (birthYear !== 'all' && !d.teams.some((t) => t.aging_out.by_year)) {
            setBirthYear('all')
            localStorage.setItem('leagueview-birth-year', 'all')
            setByYearMissing(true)
          } else {
            setByYearMissing(false)
          }
        }
      })
      .catch((e) => { if (!ignore) { setError(e.message); setLoading(false) } })
    return () => { ignore = true }
  }, [league]) // eslint-disable-line react-hooks/exhaustive-deps

  function switchLeague(l) {
    setLeague(l)
    setPos(POSITIONS[0])
    setBirthYear('all')
    localStorage.setItem('leagueview-birth-year', 'all')
  }

  function selectBirthYear(y) {
    setBirthYear(y)
    localStorage.setItem('leagueview-birth-year', y)
  }

  const availableYears = useMemo(
    () => (data ? deriveAvailableYears(data.teams) : ['all']),
    [data]
  )

  if (error) return <div className="state-msg">Failed to load data: {error}</div>
  if (!data) return <div className="state-msg">Loading…</div>

  const scraped = new Date(data.scraped_at)
  const scrapeLabel = scraped.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  const sorted = [...data.teams]
    .filter((t) => {
      // D1: when a birth year is active, show all teams (no hiding zeros)
      if (birthYear !== 'all') return true
      return pos.key === 'all' || t.aging_out[pos.key] > 0
    })
    .sort((a, b) => {
      const aInfo = getAgingInfo(a, birthYear, pos.key)
      const bInfo = getAgingInfo(b, birthYear, pos.key)
      return bInfo.count - aInfo.count
    })

  const showYearChips = availableYears.length > 1

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

      {byYearMissing && (
        <p className="by-year-notice">Birth year data updating — showing all classes</p>
      )}

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

      {showYearChips && (
        <div className="year-filter" role="group" aria-label="Filter by birth year">
          {availableYears.map((y) => (
            <button
              key={y}
              className="year-pill"
              aria-pressed={birthYear === y}
              onClick={() => selectBirthYear(y)}
            >
              {y === 'all' ? 'All classes' : y}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 && pos.key !== 'all' && birthYear === 'all' ? (
        <EmptyState position={pos.key} onClear={() => setPos(POSITIONS[0])} />
      ) : (
        <main className="grid" style={{ opacity: loading ? 0.4 : 1 }}>
          {sorted.map((team, i) => {
            const { count, counts } = getAgingInfo(team, birthYear, pos.key)
            return (
              <TeamCard
                key={team.team_id}
                team={team}
                rank={i + 1}
                posKey={pos.key}
                agingCount={count}
                agingCounts={counts}
              />
            )
          })}
        </main>
      )}

      <footer className="footer">
        Data sourced from {data.league_name} league API · not affiliated with {data.league_name}
      </footer>
    </div>
  )
}
