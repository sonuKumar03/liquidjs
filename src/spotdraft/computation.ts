import { durationTypes, DurationType, DurationValue, isDuration, isValidDate } from './types'

export type ArithmeticOperation = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'

function isObject (value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null
}

function isDefined (value: unknown): boolean {
  return value !== null && value !== undefined
}

function isValidNumber (value: unknown): boolean {
  return isDefined(value) && !Number.isNaN(Number(value))
}

function precision (value: unknown): number {
  if (!isValidNumber(value)) return 0
  const parts = String(value).split('.')
  return parts.length > 1 ? parts[1].length : 0
}

function operationOnItem (lhs: unknown, rhs: unknown, operation: ArithmeticOperation): number | null {
  const places = Math.max(precision(lhs), precision(rhs))
  if (operation === 'ADD' || operation === 'SUBTRACT') {
    if (!isValidNumber(lhs) && !isValidNumber(rhs)) return 0
    if (isValidNumber(lhs) && !isValidNumber(rhs)) return Number(lhs)
    if (!isValidNumber(lhs) && isValidNumber(rhs)) return operation === 'ADD' ? Number(rhs) : -Number(rhs)
    const result = operation === 'ADD' ? Number(lhs) + Number(rhs) : Number(lhs) - Number(rhs)
    return Number(result.toFixed(places))
  }

  if (!isValidNumber(lhs) || !isValidNumber(rhs)) return 0
  if (operation === 'DIVIDE') {
    if (Number(rhs) === 0) return null
    return Number((Number(lhs) / Number(rhs)).toFixed(Math.max(places, 3)))
  }
  return Number((Number(lhs) * Number(rhs)).toFixed(places))
}

function numericKeys (value: Record<string, any>): string[] {
  return Object.keys(value).filter(key => !Number.isNaN(parseInt(String(value[key]), 10)))
}

function defaultObjectResult (result: Record<string, any>, lhs: unknown, rhs: unknown, operation: ArithmeticOperation) {
  result.value = operationOnItem(lhs, rhs, operation)
  return result
}

function durationResult (lhs: DurationValue, rhs: DurationValue, operation: ArithmeticOperation): DurationValue {
  if (lhs.days == null || rhs.days == null) return { type: 'DAYS', value: 0, days: 0 }
  const days = operationOnItem(lhs.days, rhs.days, operation)
  return { type: 'DAYS', value: days, days }
}

function startOfDay (value: Date | string): Date {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function operationOnDates (lhs: Date | string, rhs: Date | string, operation: ArithmeticOperation): DurationValue | null {
  if (operation !== 'SUBTRACT') return null
  const days = Math.max(0, Math.round((startOfDay(lhs).getTime() - startOfDay(rhs).getTime()) / 86400000))
  return { type: 'DAYS', value: days, days }
}

function operationOnDateDuration (dateValue: Date | string, duration: DurationValue, operation: ArithmeticOperation): Date | null {
  if (operation !== 'ADD' && operation !== 'SUBTRACT') return null
  if (!duration.value || !durationTypes.includes(duration.type)) return new Date(dateValue)
  const amount = Number(duration.value) * (operation === 'ADD' ? 1 : -1)
  const date = new Date(dateValue)
  if (duration.type === 'DAYS') date.setDate(date.getDate() + amount)
  if (duration.type === 'WEEKS') date.setDate(date.getDate() + amount * 7)
  if (duration.type === 'MONTHS') date.setMonth(date.getMonth() + amount)
  if (duration.type === 'YEARS') date.setFullYear(date.getFullYear() + amount)
  return date
}

export function performOperation (lhs: unknown, rhs: unknown, operation: ArithmeticOperation): unknown {
  if (isValidDate(lhs) && isValidDate(rhs)) return operationOnDates(lhs, rhs, operation)
  if (isValidDate(lhs) && isObject(rhs)) {
    return isDuration(rhs) ? operationOnDateDuration(lhs, rhs, operation) : lhs
  }
  if (isObject(lhs) && isObject(rhs)) {
    if (isDuration(lhs) && isDuration(rhs)) return durationResult(lhs, rhs, operation)
    let result = { ...rhs, ...lhs }
    const lhsKeys = numericKeys(lhs)
    const rhsKeys = numericKeys(rhs)
    const commonKeys = lhsKeys.filter(key => rhsKeys.includes(key))
    if (commonKeys.length) {
      for (const key of rhsKeys) result[key] = operationOnItem(lhs[key], rhs[key], operation)
    } else {
      result = defaultObjectResult(result, lhsKeys.length ? lhs[lhsKeys[0]] : 0, rhsKeys.length ? rhs[rhsKeys[0]] : 0, operation)
    }
    return result
  }
  if (typeof lhs === 'number' && isObject(rhs)) {
    const result = { ...rhs }
    const keys = numericKeys(rhs)
    if (!keys.length) return defaultObjectResult(result, lhs, 0, operation)
    for (const key of keys) result[key] = operationOnItem(lhs, rhs[key], operation)
    return result
  }
  if (isObject(lhs) && typeof rhs === 'number') {
    const result = { ...lhs }
    const keys = numericKeys(lhs)
    if (!keys.length) return defaultObjectResult(result, 0, rhs, operation)
    for (const key of keys) result[key] = operationOnItem(lhs[key], rhs, operation)
    return result
  }
  if ((isObject(lhs) && !isDefined(rhs)) || (isObject(rhs) && !isDefined(lhs))) return null
  return operationOnItem(lhs, rhs, operation)
}

export function toCurrency (value: unknown, type: unknown) {
  if (isValidNumber(value) && typeof type === 'string') return { value, type }
  throw new Error('invalid currency value or type')
}

export function toDuration (value: unknown, type: unknown): DurationValue {
  const normalizedType = typeof type === 'string' ? type.toUpperCase() as DurationType : undefined
  if (!isValidNumber(value) || !normalizedType || !durationTypes.includes(normalizedType)) {
    throw new Error('invalid duration value or type')
  }
  const multiplier = normalizedType === 'DAYS' ? 1 : normalizedType === 'WEEKS' ? 7 : normalizedType === 'MONTHS' ? 30 : 365
  return { value, type: normalizedType, days: Number(value) * multiplier }
}

export function sumArray (values: unknown, key?: unknown, defaultSum: unknown = 0): unknown {
  if (!Array.isArray(values)) throw new Error('Input is not an array')
  if (!values.length) return defaultSum
  if (key !== undefined && typeof key !== 'string') throw new Error('Invalid key for sumArray filter')
  const items = key === undefined ? values : values.map(item => isObject(item) ? item[key] : undefined)
  return items.reduce((result, item) => performOperation(result, item, 'ADD'))
}

export function updateAttribute (value: unknown, attribute: unknown, replacement: unknown): unknown {
  const key = String(attribute)
  if (!isDefined(value)) return { [key]: replacement }
  if (isObject(value)) return { ...value, [key]: replacement }
  return null
}
