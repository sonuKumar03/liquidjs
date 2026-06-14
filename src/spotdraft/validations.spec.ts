import { Liquid } from '../liquid'
import { checkAtleastOneDynamicTableAssignPresent, checkValidJSON, checkVariableAssignedBeforeUsed } from './validations'

describe('SpotDraft validation compatibility', () => {
  const liquid = new Liquid()

  it('reports invalid parseAssign literals', () => {
    const errors = checkValidJSON(liquid, `{% parseAssign valid = '[1, 2]' %}{% parseAssign invalid = unquoted %}`)
    expect(errors).toHaveLength(1)
    expect(errors[0].expression).toContain('parseAssign invalid')
  })

  it('reports variables used before assignment', () => {
    expect(checkVariableAssignedBeforeUsed(liquid, `{% assign result = unknownVar | plus: 10 %}`))
      .toEqual(['Variable "unknownVar" used before assignment in expression "result = unknownVar | plus: 10" on line 1'])
  })

  it('accepts variables established by earlier assignments and conditions', () => {
    const source = `{% assign safe = 10 %}{% if condition %}{% assign result = safe | plus: condition %}{% endif %}`
    expect(checkVariableAssignedBeforeUsed(liquid, source)).toEqual([])
  })

  it('requires a top-level $$answer assignment in computeColumn', () => {
    const invalid = `{% computeColumn table result %}{% if yes %}{% assign $$answer = 1 %}{% endif %}{% endcomputeColumn %}`
    expect(checkAtleastOneDynamicTableAssignPresent(liquid, invalid)).toEqual([{
      message: '$$answer is not assigned outside any loops or condition block',
      metadata: { tableName: 'table', columnName: 'result' }
    }])
    const valid = `{% computeColumn table result %}{% assign $$answer = 1 %}{% endcomputeColumn %}`
    expect(checkAtleastOneDynamicTableAssignPresent(liquid, valid)).toEqual([])
  })
})
