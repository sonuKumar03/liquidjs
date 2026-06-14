import { Liquid } from '../liquid'
import { updateAttribute } from './computation'

describe('SpotDraft attribute update regression coverage', () => {
  test.each([
    [{ value: 1000, type: 'INR' }, 'type', 'EUR', { value: 1000, type: 'EUR' }],
    [{ value: null, type: 'INR' }, 'type', 'EUR', { value: null, type: 'EUR' }],
    [undefined, 'type', 'EUR', { type: 'EUR' }]
  ])('updates %p attribute %s', (value, attribute, replacement, expected) => {
    expect(updateAttribute(value, attribute, replacement)).toEqual(expected)
  })

  it('does not mutate the source object', () => {
    const source = { value: 1000, type: 'INR' }
    expect(updateAttribute(source, 'type', 'EUR')).toEqual({ value: 1000, type: 'EUR' })
    expect(source).toEqual({ value: 1000, type: 'INR' })
  })

  const liquid = new Liquid({ keepOutputType: true })

  test.each([
    ['{{ currency | updateAttribute: "type", "EUR" }}', { value: 1000, type: 'EUR' }],
    ['{{ nullCurrency | updateAttribute: "type", "EUR" }}', { value: null, type: 'EUR' }],
    ['{{ missing | updateAttribute: "type", "EUR" }}', { type: 'EUR' }],
    ['{{ currency | updateTypeAttribute: "EUR" }}', { value: 1000, type: 'EUR' }],
    ['{{ nullCurrency | updateTypeAttribute: "EUR" }}', { value: null, type: 'EUR' }],
    ['{{ missing | updateTypeAttribute: "EUR" }}', { type: 'EUR' }]
  ])('%s preserves legacy filter behavior', async (template, expected) => {
    await expect(liquid.parseAndRender(template, {
      currency: { value: 1000, type: 'INR' },
      nullCurrency: { value: null, type: 'INR' }
    })).resolves.toEqual(expected)
  })
})
