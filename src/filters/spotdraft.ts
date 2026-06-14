import { performOperation, sumArray as sum, toCurrency as currency, toDuration as duration, updateAttribute as update } from '../spotdraft'

export const plus = (lhs: unknown, rhs: unknown) => performOperation(lhs, rhs, 'ADD')
export const minus = (lhs: unknown, rhs: unknown) => performOperation(lhs, rhs, 'SUBTRACT')
export const times = (lhs: unknown, rhs: unknown) => performOperation(lhs, rhs, 'MULTIPLY')
export const divided_by = (lhs: unknown, rhs: unknown, integerArithmetic = false) => {
  if (integerArithmetic && lhs != null && rhs != null && !Number.isNaN(Number(lhs)) && !Number.isNaN(Number(rhs))) {
    return Math.floor(Number(lhs) / Number(rhs))
  }
  return performOperation(lhs, rhs, 'DIVIDE')
}
export const toCurrency = currency
export const toDuration = duration
export const sumArray = sum
export const updateAttribute = update
export const updateTypeAttribute = (value: unknown, type: unknown) => update(value, 'type', type)
