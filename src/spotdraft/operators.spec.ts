import { Liquid } from '../liquid'
import { spotDraftCompare, spotDraftEquals } from './operators'

const durationYear = { value: 1, type: 'YEARS', days: 365 }
const durationTwoYears = { value: 2, type: 'YEARS', days: 730 }
const durationTwoMonths = { value: 2, type: 'MONTHS', days: 60 }
const currencyUsd100 = { value: 100, type: 'USD' }
const currencyUsd200 = { value: 200, type: 'USD' }
const currencyInr100 = { value: 100, type: 'INR' }
const phoneUs = { number: '9876543210', code: '+1', country_code: '+1' }
const phoneOtherNumber = { number: '1111111', code: '+1', country_code: '+1' }
const phoneIndia = { number: '9876543210', code: '+91', country_code: '+91' }
const iso2000 = new Date(Date.UTC(2000, 0, 1)).toISOString()
const date2000 = '2000-01-01'
const date2001 = '2001-01-01'
const unsupportedDate = '01-01-2001'

describe('SpotDraft equality operator regression coverage', () => {
  test.each([
    [1, '1'],
    [5, '1'],
    ['1', 5],
    ['5', true],
    [5, {}]
  ])('uses strict equality for operands of different types: %p and %p', (left, right) => {
    expect(spotDraftEquals(left, right)).toBe(left === right)
  })

  test.each([
    [0, 0, true], [-10, -10, true], [10, 10, true], [1, 2, false],
    ['', '', true], ['abc', 'abc', true], ['123', '123', true], ['abc', 'abd', false],
    [true, true, true], [false, false, true], [true, false, false]
  ])('compares primitive values: %p == %p is %p', (left, right, expected) => {
    expect(spotDraftEquals(left, right)).toBe(expected)
  })

  test.each([
    [[], [], true],
    [[1, 2, 3], [1, 2, 3], true],
    [[1, 2, 3], [3, 2, 1], true],
    [['a', 'b'], ['b', 'a'], true],
    [[1, 2, 3], [1, 2], false],
    [[{ x: 1 }, { x: 2 }], [{ x: 1 }, { x: 2 }], false]
  ])('compares arrays without order: %p and %p', (left, right, expected) => {
    expect(spotDraftEquals(left, right)).toBe(expected)
  })

  it('compares durations by normalized days', () => {
    expect(spotDraftEquals(durationYear, { ...durationYear })).toBe(true)
    expect(spotDraftEquals(durationYear, durationTwoMonths)).toBe(false)
  })

  it('compares supported date formats and falls back for unsupported formats', () => {
    expect(spotDraftEquals(iso2000, iso2000)).toBe(true)
    expect(spotDraftEquals(iso2000, date2000)).toBe(true)
    expect(spotDraftEquals(date2000, date2001)).toBe(false)
    expect(spotDraftEquals(date2001, unsupportedDate)).toBe(false)
  })

  it('compares currency value and type', () => {
    expect(spotDraftEquals(currencyUsd100, { ...currencyUsd100 })).toBe(true)
    expect(spotDraftEquals(currencyUsd100, currencyUsd200)).toBe(false)
    expect(spotDraftEquals(currencyUsd100, currencyInr100)).toBe(false)
  })

  it('compares phone number and code', () => {
    expect(spotDraftEquals(phoneUs, { ...phoneUs })).toBe(true)
    expect(spotDraftEquals(phoneUs, phoneOtherNumber)).toBe(false)
    expect(spotDraftEquals(phoneUs, phoneIndia)).toBe(false)
  })
})

describe('SpotDraft ordering operator regression coverage', () => {
  const compare = (left: any, right: any, operator: '>' | '<' | '>=' | '<=') =>
    spotDraftCompare(left, right, operator)

  test.each([
    [1, '1'], [5, '1'], ['1', 5], ['5', true], [5, {}]
  ])('uses JavaScript ordering for different operand types: %p and %p', (left, right) => {
    expect(compare(left, right, '>')).toBe(left > right)
    expect(compare(left, right, '<')).toBe(left < right)
    expect(compare(left, right, '>=')).toBe(left >= right)
    expect(compare(left, right, '<=')).toBe(left <= right)
  })

  test.each([
    [0, 0], [-1, -2], [100, 10], [1, 2],
    ['', ''], ['abc', 'abc'], ['abd', 'abc'], ['abc', 'abd'], ['abc', 'ab'], ['abc', ''],
    [true, true], [false, false], [true, false]
  ])('matches JavaScript ordering for primitives: %p and %p', (left, right) => {
    expect(compare(left, right, '>')).toBe(left > right)
    expect(compare(left, right, '<')).toBe(left < right)
    expect(compare(left, right, '>=')).toBe(left >= right)
    expect(compare(left, right, '<=')).toBe(left <= right)
  })

  it('orders durations by days regardless of their display unit', () => {
    expect(compare(durationYear, { ...durationYear }, '>')).toBe(false)
    expect(compare(durationYear, { ...durationYear }, '>=')).toBe(true)
    expect(compare(durationYear, durationTwoYears, '<')).toBe(true)
    expect(compare(durationYear, durationTwoMonths, '>')).toBe(true)
    expect(compare(durationTwoMonths, durationYear, '<=')).toBe(true)
  })

  it('orders supported dates chronologically', () => {
    expect(compare(iso2000, date2000, '>')).toBe(false)
    expect(compare(iso2000, date2000, '>=')).toBe(true)
    expect(compare(date2001, date2000, '>')).toBe(true)
    expect(compare(date2000, date2001, '<')).toBe(true)
    expect(compare(date2001, unsupportedDate, '>')).toBe(date2001 > unsupportedDate)
  })

  it('orders matching currencies and rejects different currency types', () => {
    expect(compare(currencyUsd100, { ...currencyUsd100 }, '>=')).toBe(true)
    expect(compare(currencyUsd100, currencyUsd200, '<')).toBe(true)
    expect(compare(currencyUsd200, currencyUsd100, '>')).toBe(true)
    expect(compare(currencyUsd200, currencyInr100, '>')).toBe(false)
    expect(compare(currencyUsd200, currencyInr100, '<=')).toBe(false)
  })

  it('returns false for nullish ordering', () => {
    for (const operator of ['>', '<', '>=', '<='] as const) {
      expect(compare(null, null, operator)).toBe(false)
      expect(compare(undefined, null, operator)).toBe(false)
    }
  })
})

describe('SpotDraft operators in Liquid conditions', () => {
  const liquid = new Liquid()
  const context = {
    lStr: 'left',
    rStr: 'right',
    lNum: 10,
    rNum: 100,
    lBool: false,
    rBool: true,
    lDate: date2000,
    rDate: date2001,
    lDur: durationYear,
    rDur: durationTwoYears,
    lCurr: currencyUsd100,
    rCurr: currencyUsd200,
    lPhone: phoneUs,
    rPhone: phoneOtherNumber,
    strNum10: '10'
  }
  const renderCondition = (condition: string) =>
    liquid.parseAndRender(`{% if ${condition} %}true{% else %}false{% endif %}`, context)

  test.each([
    ['lStr == lStr', 'true'], ['lStr == rStr', 'false'],
    ['lNum == lNum', 'true'], ['lNum != rNum', 'true'],
    ['lBool == rBool', 'false'], ['lDate != rDate', 'true'],
    ['lDur == lDur', 'true'], ['lDur < rDur', 'true'],
    ['lCurr >= lCurr', 'true'], ['lCurr > rCurr', 'false'],
    ['lPhone == lPhone', 'true'], ['lPhone != rPhone', 'true'],
    ['lStr < rStr', 'true'], ['lNum < rNum', 'true'],
    ['lBool < rBool', 'true'], ['lDate <= rDate', 'true'],
    ['lDur >= rDur', 'false'], ['rCurr > lCurr', 'true'],
    ['lNum == strNum10', 'false'], ['lNum >= strNum10', 'true']
  ])('%s renders %s', async (condition, expected) => {
    await expect(renderCondition(condition)).resolves.toBe(expected)
  })
})
