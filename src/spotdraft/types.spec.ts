import { getSpotDraftType, SpotDraftType } from './types'

describe('SpotDraft type assertions', () => {
  it('returns undefined for undefined, null, and NaN', () => {
    expect(getSpotDraftType(undefined)).toBeUndefined()
    expect(getSpotDraftType(null)).toBeUndefined()
    expect(getSpotDraftType(Number.NaN)).toBeUndefined()
  })

  it('handles string values', () => {
    expect(getSpotDraftType('hello')).toBe(SpotDraftType.String)
    expect(getSpotDraftType('')).toBe(SpotDraftType.String)
  })

  it('handles number values', () => {
    expect(getSpotDraftType(100)).toBe(SpotDraftType.Number)
    expect(getSpotDraftType(-100)).toBe(SpotDraftType.Number)
  })

  it('handles boolean values', () => {
    expect(getSpotDraftType(true)).toBe(SpotDraftType.Boolean)
    expect(getSpotDraftType(false)).toBe(SpotDraftType.Boolean)
  })

  it('handles date string values', () => {
    expect(getSpotDraftType(new Date(2000, 0, 1).toISOString())).toBe(SpotDraftType.Date)
    expect(getSpotDraftType('2020-01-01')).toBe(SpotDraftType.Date)
    expect(getSpotDraftType('01-01-2020')).toBe(SpotDraftType.String)
  })

  it('handles array values', () => {
    expect(getSpotDraftType([])).toBe(SpotDraftType.Array)
    expect(getSpotDraftType([1, 2, 3])).toBe(SpotDraftType.Array)
    expect(getSpotDraftType(['A', 'b'])).toBe(SpotDraftType.Array)
    expect(getSpotDraftType([{ x: 1 }, { x: 2 }])).toBe(SpotDraftType.Array)
  })

  it('handles duration values', () => {
    expect(getSpotDraftType({ value: 1, type: 'YEARS', days: 365 })).toBe(SpotDraftType.Duration)
    expect(getSpotDraftType({ value: 1, days: 365 })).toBeUndefined()
    expect(getSpotDraftType({ value: 1, type: 'CENTURY', days: 365 })).toBe(SpotDraftType.Currency)
  })

  it('handles currency values', () => {
    expect(getSpotDraftType({ value: 1, type: 'YEARS' })).toBe(SpotDraftType.Currency)
    expect(getSpotDraftType({ value: 1 })).toBeUndefined()
  })

  it('handles phone number values', () => {
    expect(getSpotDraftType({ number: '9876543210', code: '+1', country_code: '+1' }))
      .toBe(SpotDraftType.PhoneNumber)
    expect(getSpotDraftType({ number: '1111111', country_code: '+1' })).toBeUndefined()
    expect(getSpotDraftType({ number: '9876543210', code: '+91' })).toBe(SpotDraftType.PhoneNumber)
  })
})
