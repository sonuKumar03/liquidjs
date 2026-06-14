import { getSpotDraftType, SpotDraftType } from './types'

function dateTime (value: unknown): number {
  return new Date(value as string | Date).getTime()
}

export function spotDraftEquals (lhs: any, rhs: any): boolean {
  const lhsType = getSpotDraftType(lhs)
  const rhsType = getSpotDraftType(rhs)
  if (lhsType !== rhsType) return lhs === rhs
  if (lhsType === SpotDraftType.Array) {
    if (lhs.length !== rhs.length) return false
    const left = [...lhs].sort()
    const right = [...rhs].sort()
    return left.every((value, index) => value === right[index])
  }
  if (lhsType === SpotDraftType.Duration) return lhs.days === rhs.days
  if (lhsType === SpotDraftType.Date) return dateTime(lhs) === dateTime(rhs)
  if (lhsType === SpotDraftType.Currency) return lhs.value === rhs.value && lhs.type === rhs.type
  if (lhsType === SpotDraftType.PhoneNumber) return lhs.number === rhs.number && lhs.code === rhs.code
  return lhs === rhs
}

export function spotDraftCompare (lhs: any, rhs: any, operator: '>' | '<' | '>=' | '<='): boolean {
  if (lhs == null || rhs == null) return false
  const lhsType = getSpotDraftType(lhs)
  const rhsType = getSpotDraftType(rhs)
  let left = lhs
  let right = rhs
  if (lhsType === rhsType) {
    if (lhsType === SpotDraftType.Date) {
      left = dateTime(lhs)
      right = dateTime(rhs)
    } else if (lhsType === SpotDraftType.Duration) {
      left = lhs.days
      right = rhs.days
    } else if (lhsType === SpotDraftType.Currency) {
      if (lhs.type !== rhs.type) return false
      left = lhs.value
      right = rhs.value
    }
  }
  if (operator === '>') return left > right
  if (operator === '<') return left < right
  if (operator === '>=') return left >= right
  return left <= right
}
