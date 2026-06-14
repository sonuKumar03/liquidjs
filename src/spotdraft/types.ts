export const durationTypes = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'] as const

export type DurationType = typeof durationTypes[number]

export interface CurrencyValue {
  value: unknown;
  type: string;
}

export interface DurationValue extends CurrencyValue {
  type: DurationType;
  days: unknown;
}

export interface PhoneNumberValue {
  number: unknown;
  code: unknown;
}

export enum SpotDraftType {
  Date = 'date',
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
  Duration = 'duration',
  Currency = 'currency',
  PhoneNumber = 'phone-number'
}

function hasOwn (value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export function isValidDate (value: unknown): value is Date | string {
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return false
  return !Number.isNaN(Date.parse(value))
}

export function isDuration (value: unknown): value is DurationValue {
  if (!value || typeof value !== 'object') return false
  if (!hasOwn(value, 'value') || !hasOwn(value, 'type') || !hasOwn(value, 'days')) return false
  return durationTypes.includes((value as DurationValue).type)
}

export function isCurrency (value: unknown): value is CurrencyValue {
  if (!value || typeof value !== 'object') return false
  return hasOwn(value, 'value') && hasOwn(value, 'type')
}

export function isPhoneNumber (value: unknown): value is PhoneNumberValue {
  if (!value || typeof value !== 'object') return false
  return hasOwn(value, 'number') && hasOwn(value, 'code')
}

export function getSpotDraftType (value: unknown): SpotDraftType | undefined {
  if (isValidDate(value)) return SpotDraftType.Date
  if (typeof value === 'string') return SpotDraftType.String
  if (typeof value === 'number' && !Number.isNaN(value)) return SpotDraftType.Number
  if (typeof value === 'boolean') return SpotDraftType.Boolean
  if (Array.isArray(value)) return SpotDraftType.Array
  if (isDuration(value)) return SpotDraftType.Duration
  if (isCurrency(value)) return SpotDraftType.Currency
  if (isPhoneNumber(value)) return SpotDraftType.PhoneNumber
}
