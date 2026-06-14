import { Liquid } from '../liquid'
import { performOperation } from './computation'

const currency = (value: number | null, type = 'INR') => ({ value, type })
const duration = (value: number | null, type: 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS', days: number | null) =>
  ({ value, type, days })

describe('SpotDraft primitive arithmetic regression coverage', () => {
  test.each([
    ['ADD', 4, 2, 6],
    ['ADD', 183.357, 12, 195.357],
    ['ADD', '4', '1', 5],
    ['ADD', 24, null, 24],
    ['ADD', null, 24, 24],
    ['ADD', null, null, 0],
    ['SUBTRACT', 16, 4, 12],
    ['SUBTRACT', 183.357, 12, 171.357],
    ['SUBTRACT', '4', '1', 3],
    ['SUBTRACT', 24, null, 24],
    ['SUBTRACT', null, 24, -24],
    ['SUBTRACT', null, null, 0],
    ['MULTIPLY', 24, 7, 168],
    ['MULTIPLY', 183.357, 12, 2200.284],
    ['MULTIPLY', '4', '2', 8],
    ['MULTIPLY', 24, null, 0],
    ['MULTIPLY', null, 24, 0],
    ['MULTIPLY', null, null, 0],
    ['DIVIDE', 16, 4, 4],
    ['DIVIDE', 5, 3, 1.667],
    ['DIVIDE', 216000, 100, 2160],
    ['DIVIDE', '5', '3', 1.667],
    ['DIVIDE', 24, null, 0],
    ['DIVIDE', null, 24, 0],
    ['DIVIDE', null, null, 0]
  ] as const)('%s handles %p and %p', (operation, left, right, expected) => {
    expect(performOperation(left, right, operation)).toBe(expected)
  })
})

describe('SpotDraft currency arithmetic regression coverage', () => {
  test.each([
    ['ADD', currency(1000), 100, currency(1100)],
    ['ADD', currency(100), currency(10), currency(110)],
    ['ADD', currency(13.456, 'USD'), currency(14.567, 'USD'), currency(28.023, 'USD')],
    ['ADD', currency(13.456, 'USD'), 12.3, currency(25.756, 'USD')],
    ['SUBTRACT', currency(1000), 100, currency(900)],
    ['SUBTRACT', currency(1000), currency(10), currency(990)],
    ['SUBTRACT', currency(13.456, 'USD'), currency(14.567, 'USD'), currency(-1.111, 'USD')],
    ['SUBTRACT', currency(13.456, 'USD'), 12.3, currency(1.156, 'USD')],
    ['MULTIPLY', currency(10), 100, currency(1000)],
    ['MULTIPLY', currency(100), currency(10), currency(1000)],
    ['MULTIPLY', currency(13.456, 'USD'), currency(14.567, 'USD'), currency(196.014, 'USD')],
    ['MULTIPLY', currency(13.456, 'USD'), 12.3, currency(165.509, 'USD')],
    ['DIVIDE', currency(1000), 100, currency(10)],
    ['DIVIDE', currency(1000), currency(10), currency(100)],
    ['DIVIDE', currency(13.456, 'USD'), currency(14.567, 'USD'), currency(0.924, 'USD')],
    ['DIVIDE', currency(13.456, 'USD'), currency(14.5674, 'USD'), currency(0.9237, 'USD')],
    ['DIVIDE', currency(13.456, 'USD'), 12.3, currency(1.094, 'USD')]
  ] as const)('%s preserves the currency shape for %p and %p', (operation, left, right, expected) => {
    expect(performOperation(left, right, operation)).toEqual(expected)
  })

  const liquid = new Liquid({ keepOutputType: true })
  const context = {
    thousand: currency(1000),
    hundred: currency(100),
    ten: currency(10),
    nullCurrency: currency(null)
  }

  test.each([
    ['{{ hundred | plus: nullCurrency | plus: thousand }}', currency(1100)],
    ['{{ nullCurrency | plus: 2 }}', currency(2)],
    ['{{ hundred | minus: nullCurrency | minus: ten }}', currency(90)],
    ['{{ 2 | minus: nullCurrency | minus: thousand }}', currency(-998)],
    ['{{ hundred | times: nullCurrency | times: ten }}', currency(0)],
    ['{{ thousand | divided_by: nullCurrency | divided_by: hundred }}', currency(0)],
    ['{{ thousand | divided_by: hundred | divided_by: nullCurrency }}', currency(null)],
    ['{{ 2 | divided_by: nullCurrency | divided_by: thousand }}', currency(0)]
  ])('%s preserves legacy chained null handling', async (template, expected) => {
    await expect(liquid.parseAndRender(template, context)).resolves.toEqual(expected)
  })
})

describe('SpotDraft duration and date arithmetic regression coverage', () => {
  const twentyDays = duration(20, 'DAYS', 20)
  const tenWeeks = duration(10, 'WEEKS', 70)
  const twoMonths = duration(2, 'MONTHS', 60)
  const threeYears = duration(3, 'YEARS', 1095)

  it('adds durations using normalized days', () => {
    expect(performOperation(twentyDays, twoMonths, 'ADD')).toEqual(duration(80, 'DAYS', 80))
    expect(performOperation(tenWeeks, twoMonths, 'ADD')).toEqual(duration(130, 'DAYS', 130))
    expect(performOperation(duration(null, 'MONTHS', null), twoMonths, 'ADD')).toEqual(duration(0, 'DAYS', 0))
  })

  test.each([
    [new Date(2020, 2, 1), new Date(2020, 0, 1)],
    ['2020-03-01T00:00:00.000Z', new Date(2020, 0, 1)],
    [new Date(2020, 2, 1), '2020-01-01T00:00:00.000Z'],
    ['2020-03-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'],
    ['2020-03-01', '2020-01-01']
  ])('subtracts supported date representations: %p minus %p', (left, right) => {
    expect(performOperation(left, right, 'SUBTRACT')).toEqual(duration(60, 'DAYS', 60))
  })

  test.each([
    ['ADD', twentyDays, new Date(2020, 0, 21), '2020-01-21T00:00:00.000Z'],
    ['ADD', tenWeeks, new Date(2020, 2, 11), '2020-03-11T00:00:00.000Z'],
    ['ADD', twoMonths, new Date(2020, 2, 1), '2020-03-01T00:00:00.000Z'],
    ['ADD', threeYears, new Date(2023, 0, 1), '2023-01-01T00:00:00.000Z'],
    ['SUBTRACT', twentyDays, new Date(2019, 11, 12), '2019-12-12T00:00:00.000Z'],
    ['SUBTRACT', twoMonths, new Date(2019, 10, 1), '2019-11-01T00:00:00.000Z'],
    ['SUBTRACT', threeYears, new Date(2017, 0, 1), '2017-01-01T00:00:00.000Z']
  ] as const)('%s applies %p to a date', (operation, value, localExpected, stringExpected) => {
    expect(performOperation(new Date(2020, 0, 1), value, operation)).toEqual(localExpected)
    expect(performOperation('2020-01-01', value, operation)).toEqual(new Date(stringExpected))
  })

  it('leaves a date unchanged for invalid or empty durations', () => {
    const date = new Date(2020, 0, 1)
    expect(performOperation(date, {}, 'ADD')).toBe(date)
    expect(performOperation(date, duration(null, 'MONTHS', null), 'ADD')).toEqual(date)
  })
})
