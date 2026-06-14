import { Liquid } from '../liquid'
import { toCurrency, toDuration } from './computation'

describe('SpotDraft currency constructor regression coverage', () => {
  test.each([
    [8000, 'INR', { value: 8000, type: 'INR' }],
    [100, 'USD', { value: 100, type: 'USD' }],
    [150.1, 'USD', { value: 150.1, type: 'USD' }]
  ])('constructs %p %s', (value, type, expected) => {
    expect(toCurrency(value, type)).toEqual(expected)
  })

  test.each([
    ['text', 'USD'],
    [null, 'USD'],
    [undefined, 'USD'],
    [Number.NaN, 'USD'],
    [100, 1],
    [100, null],
    [100, undefined]
  ])('rejects invalid currency input %p and %p', (value, type) => {
    expect(() => toCurrency(value, type)).toThrow('invalid currency value or type')
  })

  it('constructs currencies through the registered Liquid filter', async () => {
    const liquid = new Liquid({ keepOutputType: true })
    await expect(liquid.parseAndRender('{{ amount | toCurrency: code }}', { amount: 1000, code: 'INR' }))
      .resolves.toEqual({ value: 1000, type: 'INR' })
    await expect(liquid.parseAndRender('{{ invalid | toCurrency: "USD" }}', { invalid: null }))
      .rejects.toThrow('invalid currency value or type')
  })
})

describe('SpotDraft duration constructor regression coverage', () => {
  test.each([
    [10, 'Days', { value: 10, type: 'DAYS', days: 10 }],
    [7, 'weeks', { value: 7, type: 'WEEKS', days: 49 }],
    [5, 'months', { value: 5, type: 'MONTHS', days: 150 }],
    [2, 'Years', { value: 2, type: 'YEARS', days: 730 }]
  ])('normalizes %p %s', (value, type, expected) => {
    expect(toDuration(value, type)).toEqual(expected)
  })

  test.each([
    ['text', 'DAYS'],
    [Number.NaN, 'DAYS'],
    [undefined, 'MONTHS'],
    [null, 'MONTHS'],
    [2, 'FORTNIGHTS'],
    [10, 10],
    [10, null],
    [10, undefined]
  ])('rejects invalid duration input %p and %p', (value, type) => {
    expect(() => toDuration(value, type)).toThrow('invalid duration value or type')
  })

  it('constructs durations through the registered Liquid filter', async () => {
    const liquid = new Liquid({ keepOutputType: true })
    const existing = { value: 10, type: 'WEEKS' }
    await expect(liquid.parseAndRender('{{ existing.value | toDuration: existing.type }}', { existing }))
      .resolves.toEqual({ value: 10, type: 'WEEKS', days: 70 })
    await expect(liquid.parseAndRender('{{ 2 | toDuration: invalidType }}', { invalidType: 'FORTNIGHTS' }))
      .rejects.toThrow('invalid duration value or type')
  })
})
