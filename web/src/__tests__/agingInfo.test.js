import { describe, it, expect } from 'vitest'
import { getAgingInfo, deriveAvailableYears } from '../App.jsx'

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
