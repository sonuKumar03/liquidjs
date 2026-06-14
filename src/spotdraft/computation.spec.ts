import { Liquid } from '../liquid'
import { performOperation, spotDraftCompare, spotDraftEquals, sumArray, toCurrency, toDuration, updateAttribute } from '.'

describe('SpotDraft computation compatibility', () => {
  it('preserves decimal precision and null arithmetic', () => {
    expect(performOperation(183.357, 12, 'ADD')).toBe(195.357)
    expect(performOperation(null, 24, 'ADD')).toBe(24)
    expect(performOperation(null, null, 'ADD')).toBe(0)
    expect(performOperation(10, 0, 'DIVIDE')).toBeNull()
  })

  it('computes currencies and durations without mutating inputs', () => {
    const currency = { value: 10.123, type: 'USD' }
    expect(performOperation(currency, 2, 'ADD')).toEqual({ value: 12.123, type: 'USD' })
    expect(currency).toEqual({ value: 10.123, type: 'USD' })
    expect(performOperation(toDuration(2, 'months'), toDuration(3, 'weeks'), 'ADD'))
      .toEqual({ value: 81, type: 'DAYS', days: 81 })
  })

  it('supports CommonForm constructors, updates, and sums', () => {
    expect(toCurrency(10, 'INR')).toEqual({ value: 10, type: 'INR' })
    expect(toDuration(2, 'years')).toEqual({ value: 2, type: 'YEARS', days: 730 })
    expect(updateAttribute(undefined, 'type', 'EUR')).toEqual({ type: 'EUR' })
    expect(sumArray([{ value: 10, type: 'INR' }, { value: 2, type: 'INR' }]))
      .toEqual({ value: 12, type: 'INR' })
  })

  it('preserves custom comparison semantics', () => {
    expect(spotDraftEquals(['b', 'a'], ['a', 'b'])).toBe(true)
    expect(spotDraftEquals({ value: 10, type: 'USD' }, { value: 10, type: 'USD' })).toBe(true)
    expect(spotDraftCompare(toDuration(2, 'weeks'), toDuration(10, 'days'), '>')).toBe(true)
    expect(spotDraftCompare(null, null, '>=')).toBe(false)
  })

  it('registers the compatibility filters and operators by default', async () => {
    const liquid = new Liquid({ keepOutputType: true })
    await expect(liquid.parseAndRender('{{ price | plus: 2 }}', { price: { value: 10, type: 'USD' } }))
      .resolves.toEqual({ value: 12, type: 'USD' })
    await expect(liquid.parseAndRender('{{ 2 | toDuration: "weeks" }}')).resolves
      .toEqual({ value: 2, type: 'WEEKS', days: 14 })
    await expect(liquid.parseAndRender('{% if left == right %}yes{% else %}no{% endif %}', {
      left: ['a', 'b'],
      right: ['b', 'a']
    })).resolves.toBe('yes')
  })
})
