import { describe, it, expect } from 'vitest'
import { getAgingInfo, deriveAvailableYears } from '../App.jsx'

// ── getAgingInfo ──────────────────────────────────────────────────────────────

const team = {
  aging_out: {
    F: 3, D: 2, G: 0,
    by_year: {
      '2007': { F: 1, D: 1, G: 0 },
      '2009': { F: 2, D: 1, G: 0 },
    },
  },
  returning: { F: 5, D: 3, G: 1 },
}

describe('getAgingInfo', () => {
  it('birthYear=all posKey=all → total F+D+G, normalized counts', () => {
    const { count, counts } = getAgingInfo(team, 'all', 'all')
    expect(count).toBe(5)
    expect(counts).toEqual({ F: 3, D: 2, G: 0 })
    expect(counts.by_year).toBeUndefined()
  })

  it('birthYear=all posKey=F → aging_out.F', () => {
    const { count, counts } = getAgingInfo(team, 'all', 'F')
    expect(count).toBe(3)
    expect(counts).toEqual({ F: 3, D: 2, G: 0 })
  })

  it('birthYear=2009 posKey=all → by_year sum', () => {
    const { count, counts } = getAgingInfo(team, '2009', 'all')
    expect(count).toBe(3)
    expect(counts).toEqual({ F: 2, D: 1, G: 0 })
  })

  it('birthYear=2009 posKey=F → by_year F count', () => {
    const { count } = getAgingInfo(team, '2009', 'F')
    expect(count).toBe(2)
  })

  it('birthYear=2009 posKey=G → 0 (no goalies that year)', () => {
    const { count } = getAgingInfo(team, '2009', 'G')
    expect(count).toBe(0)
  })

  it('team missing by_year → fallback {F:0,D:0,G:0}', () => {
    const noByYear = { aging_out: { F: 3, D: 2, G: 0 }, returning: { F: 1, D: 1, G: 0 } }
    const { count, counts } = getAgingInfo(noByYear, '2009', 'all')
    expect(count).toBe(0)
    expect(counts).toEqual({ F: 0, D: 0, G: 0 })
  })
})

// ── deriveAvailableYears ──────────────────────────────────────────────────────

describe('deriveAvailableYears', () => {
  it('teams with by_year → ["all", ...sorted years]', () => {
    const teams = [
      { aging_out: { F: 1, D: 0, G: 0, by_year: { '2009': { F: 1, D: 0, G: 0 }, '2007': { F: 0, D: 1, G: 0 } } } },
      { aging_out: { F: 0, D: 1, G: 0, by_year: { '2008': { F: 0, D: 1, G: 0 } } } },
    ]
    expect(deriveAvailableYears(teams)).toEqual(['all', '2007', '2008', '2009'])
  })

  it('teams without by_year → ["all"] only', () => {
    const teams = [
      { aging_out: { F: 3, D: 2, G: 0 } },
      { aging_out: { F: 1, D: 0, G: 1 } },
    ]
    expect(deriveAvailableYears(teams)).toEqual(['all'])
  })

  it('overlapping years across teams → deduplicates', () => {
    const teams = [
      { aging_out: { F: 1, D: 0, G: 0, by_year: { '2009': { F: 1, D: 0, G: 0 } } } },
      { aging_out: { F: 0, D: 1, G: 0, by_year: { '2009': { F: 0, D: 1, G: 0 } } } },
    ]
    const years = deriveAvailableYears(teams)
    expect(years).toEqual(['all', '2009'])
    expect(years.filter((y) => y === '2009').length).toBe(1)
  })
})
