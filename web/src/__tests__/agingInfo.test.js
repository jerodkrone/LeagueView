import { describe, it, expect } from 'vitest'
import { getAgingInfo, getReturningInfo, deriveAvailableYears } from '../App.jsx'

// ── getAgingInfo ──────────────────────────────────────────────────────────────

const team = {
  aging_out: {
    F: 3, D: 2, G: 0,
    by_year: {
      '2026': { F: 1, D: 1, G: 0 },
      '2028': { F: 2, D: 1, G: 0 },
    },
  },
  returning: { F: 5, D: 3, G: 1 },
}

describe('getAgingInfo', () => {
  it('birthYear=2028 posKey=all → by_year sum', () => {
    const { count, counts } = getAgingInfo(team, '2028', 'all')
    expect(count).toBe(3)
    expect(counts).toEqual({ F: 2, D: 1, G: 0 })
  })

  it('birthYear=2028 posKey=F → by_year F count', () => {
    const { count } = getAgingInfo(team, '2028', 'F')
    expect(count).toBe(2)
  })

  it('birthYear=2028 posKey=G → 0 (no goalies that year)', () => {
    const { count } = getAgingInfo(team, '2028', 'G')
    expect(count).toBe(0)
  })

  it('team missing by_year → fallback {F:0,D:0,G:0}', () => {
    const noByYear = { aging_out: { F: 3, D: 2, G: 0 }, returning: { F: 1, D: 1, G: 0 } }
    const { count, counts } = getAgingInfo(noByYear, '2028', 'all')
    expect(count).toBe(0)
    expect(counts).toEqual({ F: 0, D: 0, G: 0 })
  })
})

// ── getReturningInfo ──────────────────────────────────────────────────────────

// returning.by_year is cumulative-decreasing ("still eligible AFTER the season
// ending in this year") and sparse — keys exist only for this team's own
// age-out years. Roster here ages out in 2026 (1), 2027 (5), and 2029 (4):
// no 2028 key, and nothing past 2029.
const retTeam = {
  aging_out: { F: 1, D: 0, G: 0 },
  returning: {
    F: 5, D: 3, G: 1,
    by_year: {
      '2026': { F: 5, D: 3, G: 1 },
      '2027': { F: 3, D: 1, G: 0 },
      '2029': { F: 0, D: 0, G: 0 },
    },
  },
}

describe('getReturningInfo', () => {
  it('exact year present → that entry', () => {
    const { count, counts } = getReturningInfo(retTeam, '2027', 'all')
    expect(count).toBe(4)
    expect(counts).toEqual({ F: 3, D: 1, G: 0 })
  })

  it('posKey filters the entry', () => {
    expect(getReturningInfo(retTeam, '2027', 'F').count).toBe(3)
    expect(getReturningInfo(retTeam, '2027', 'G').count).toBe(0)
  })

  // Regression: years past the team's final age-out year used to fall back to
  // the flat returning totals, so the league's last selectable year showed
  // full rosters "returning" for every team that had no entry for it.
  it('year past the team\'s final key → zeros from the final key, not flat totals', () => {
    const { count, counts } = getReturningInfo(retTeam, '2030', 'all')
    expect(count).toBe(0)
    expect(counts).toEqual({ F: 0, D: 0, G: 0 })
  })

  it('sparse mid-gap year → entry at the largest key below it', () => {
    // Nobody ages out in 2028, so "still eligible after 2028" equals
    // "still eligible after 2027".
    const { count, counts } = getReturningInfo(retTeam, '2028', 'all')
    expect(count).toBe(4)
    expect(counts).toEqual({ F: 3, D: 1, G: 0 })
  })

  it('legacy data without by_year → flat totals fallback', () => {
    const legacy = { aging_out: { F: 3, D: 2, G: 0 }, returning: { F: 5, D: 3, G: 1 } }
    const { count, counts } = getReturningInfo(legacy, '2028', 'all')
    expect(count).toBe(9)
    expect(counts).toEqual({ F: 5, D: 3, G: 1 })
  })

  it('legacy data with no key at or below the year → flat totals fallback', () => {
    // Old-format files had no 2026 key (per-year grouping started at 2027).
    const oldFormat = {
      aging_out: { F: 1, D: 0, G: 0 },
      returning: { F: 5, D: 3, G: 1, by_year: { '2027': { F: 2, D: 1, G: 0 } } },
    }
    const { count } = getReturningInfo(oldFormat, '2026', 'all')
    expect(count).toBe(9)
  })
})

// ── deriveAvailableYears ──────────────────────────────────────────────────────

describe('deriveAvailableYears', () => {
  it('teams with by_year → sorted years', () => {
    const teams = [
      { aging_out: { F: 1, D: 0, G: 0, by_year: { '2028': { F: 1, D: 0, G: 0 }, '2026': { F: 0, D: 1, G: 0 } } } },
      { aging_out: { F: 0, D: 1, G: 0, by_year: { '2027': { F: 0, D: 1, G: 0 } } } },
    ]
    expect(deriveAvailableYears(teams)).toEqual(['2026', '2027', '2028'])
  })

  it('teams without by_year → []', () => {
    const teams = [
      { aging_out: { F: 3, D: 2, G: 0 } },
      { aging_out: { F: 1, D: 0, G: 1 } },
    ]
    expect(deriveAvailableYears(teams)).toEqual([])
  })

  it('overlapping years across teams → deduplicates', () => {
    const teams = [
      { aging_out: { F: 1, D: 0, G: 0, by_year: { '2028': { F: 1, D: 0, G: 0 } } } },
      { aging_out: { F: 0, D: 1, G: 0, by_year: { '2028': { F: 0, D: 1, G: 0 } } } },
    ]
    const years = deriveAvailableYears(teams)
    expect(years).toEqual(['2028'])
    expect(years.filter((y) => y === '2028').length).toBe(1)
  })
})
