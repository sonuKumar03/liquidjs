import { Liquid } from '../liquid'
import { sumArray } from './computation'

const currency = (value: number | null) => ({ value, type: 'INR' })
const duration = (value: number | null, type: 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS', days: number | null) =>
  ({ value, type, days })

const tenWeeks = duration(10, 'WEEKS', 70)
const twentyDays = duration(20, 'DAYS', 20)
const twoMonths = duration(2, 'MONTHS', 60)
const nullDuration = duration(null, 'MONTHS', null)

describe('SpotDraft sumArray regression coverage', () => {
  it('rejects non-array input and non-string keys', () => {
    expect(() => sumArray(null)).toThrow('Input is not an array')
    expect(() => sumArray([{ value: 1 }], 0)).toThrow('Invalid key for sumArray filter')
  })

  it('handles empty, numeric, and mixed arrays', () => {
    expect(sumArray([])).toBe(0)
    expect(sumArray([], undefined, 10)).toBe(10)
    expect(sumArray([1, 2, 3, 4, 5])).toBe(15)
    expect(sumArray([undefined, 1, null, 2, {}, 3, 'a', 5, true])).toBe(6)
  })

  test.each([
    [[tenWeeks, twentyDays, twoMonths, duration(3, 'YEARS', 1095)], duration(1245, 'DAYS', 1245)],
    [[tenWeeks, twentyDays, nullDuration], duration(0, 'DAYS', 0)],
    [[tenWeeks, nullDuration, twentyDays], duration(20, 'DAYS', 20)],
    [[nullDuration, tenWeeks, twentyDays], duration(20, 'DAYS', 20)],
    [[tenWeeks, twentyDays, 3], duration(93, 'DAYS', 93)],
    [[3, tenWeeks, twentyDays], duration(93, 'DAYS', 93)]
  ])('sums duration sequence %p', (values, expected) => {
    expect(sumArray(values)).toEqual(expected)
  })

  it('propagates a raw null in duration and currency arrays', () => {
    expect(sumArray([tenWeeks, null, twentyDays])).toBeNull()
    expect(sumArray([currency(1000), null, currency(100)])).toBeNull()
  })

  test.each([
    [[currency(1000), currency(100), currency(10)], currency(1110)],
    [[currency(1000), currency(13.456), currency(14.567)], currency(1028.023)],
    [[currency(1000), currency(100), currency(null)], currency(1100)],
    [[currency(1000), currency(null), currency(100)], currency(1100)],
    [[currency(null), currency(100), currency(10)], currency(110)],
    [[currency(1000), currency(100), 3], currency(1103)],
    [[3, currency(1000), currency(100)], currency(1103)]
  ])('sums currency sequence %p', (values, expected) => {
    expect(sumArray(values)).toEqual(expected)
  })

  it('adds durations to a date and rejects a second date in the fold', () => {
    const start = new Date(2020, 0, 1)
    expect(sumArray([start, tenWeeks, twentyDays])).toEqual(new Date(2020, 2, 31))
    expect(sumArray([start, tenWeeks, new Date(2020, 2, 1)])).toBeNull()
  })

  test.each([
    [[{ cost: 100 }, { cost: 200 }, { cost: 300 }], 'cost', 600],
    [[{ cost: 100 }, { cost: 200 }, { cost: null }], 'cost', 300],
    [[{ cost: 100 }, { cost: 200 }, {}], 'cost', 300],
    [[{ time: tenWeeks }, { time: twentyDays }, { time: twoMonths }], 'time', duration(150, 'DAYS', 150)],
    [[{ time: tenWeeks }, { time: twentyDays }, { time: nullDuration }], 'time', duration(0, 'DAYS', 0)],
    [[{ price: currency(1000) }, { price: currency(100) }, { price: currency(10) }], 'price', currency(1110)],
    [[{ price: currency(1000) }, { price: currency(null) }, { price: currency(10) }], 'price', currency(1010)]
  ])('sums table column %s from %p', (values, key, expected) => {
    expect(sumArray(values, key)).toEqual(expected)
  })

  it('preserves behavior through the registered Liquid filter', async () => {
    const liquid = new Liquid({ keepOutputType: true })
    await expect(liquid.parseAndRender('{{ rows | sumArray: "price" }}', {
      rows: [{ price: currency(1000) }, { price: currency(100) }, { price: currency(10) }]
    })).resolves.toEqual(currency(1110))
    await expect(liquid.parseAndRender('{{ value | sumArray }}', { value: null }))
      .rejects.toThrow('Input is not an array')
  })
})
