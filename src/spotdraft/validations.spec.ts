import { Liquid } from '../liquid'
import { checkAtleastOneDynamicTableAssignPresent, checkValidJSON, checkVariableAssignedBeforeUsed } from './validations'

describe('SpotDraft validation compatibility', () => {
  const liquid = new Liquid()

  it('reports invalid parseAssign literals', () => {
    const errors = checkValidJSON(liquid, `{% parseAssign valid = '[1, 2]' %}{% parseAssign invalid = unquoted %}`)
    expect(errors).toHaveLength(1)
    expect(errors[0].expression).toContain('parseAssign invalid')
  })

  it('exposes JSON validation on Liquid instances', () => {
    expect(liquid.checkValidJSON('{% parseAssign invalid = unquoted %}')).toHaveLength(1)
  })

  it('accepts JSON scalar, array, and object literals inside control flow', () => {
    const source = `
      {% unless a == "EUR" %}
        {% parseAssign text = "test" %}
      {% endunless %}
      {% parseAssign object = '{"key": "value"}' %}
      {% parseAssign number = "100" %}
      {% if a == "USD" %}
        {% parseAssign nestedText = "test" %}
      {% elsif a == "INR" %}
        {% parseAssign array = "[1, 2, 3]" %}
      {% else %}
        {% parseAssign boolean = "true" %}
      {% endif %}`
    expect(checkValidJSON(liquid, source)).toEqual([])
  })

  it('reports every invalid parseAssign value with its expression and line', () => {
    const source = `
      {% parseAssign tuple = 10, 0 %}
      {% parseAssign computed = a | plus: b %}
      {% if a == "INR" %}
        {% parseAssign trailingComma = [1, 2,] %}
      {% else %}
        {% parseAssign unquoted = unquotedString %}
      {% endif %}`
    expect(checkValidJSON(liquid, source)).toEqual([
      {
        expression: 'parseAssign tuple =  10, 0',
        errorMessage: 'Invalid value assigned to parseAssign statement at line 2'
      },
      {
        expression: 'parseAssign computed =  a | plus: b',
        errorMessage: 'Invalid value assigned to parseAssign statement at line 3'
      },
      {
        expression: 'parseAssign trailingComma =  [1, 2,]',
        errorMessage: 'Invalid value assigned to parseAssign statement at line 5'
      },
      {
        expression: 'parseAssign unquoted =  unquotedString',
        errorMessage: 'Invalid value assigned to parseAssign statement at line 7'
      }
    ])
  })

  it('reports variables used before assignment', () => {
    expect(checkVariableAssignedBeforeUsed(liquid, `{% assign result = unknownVar | plus: 10 %}`))
      .toEqual(['Variable "unknownVar" used before assignment in expression "result = unknownVar | plus: 10" on line 1'])
  })

  it('accepts variables established by earlier assignments and conditions', () => {
    const source = `{% assign safe = 10 %}{% if condition %}{% assign result = safe | plus: condition %}{% endif %}`
    expect(checkVariableAssignedBeforeUsed(liquid, source)).toEqual([])
  })

  test.each([
    [
      'top-level assignment',
      '{% assign result = unknownVar | plus: 10 %}',
      ['Variable "unknownVar" used before assignment in expression "result = unknownVar | plus: 10" on line 1']
    ],
    [
      'if branch',
      '{% if condition %}{% assign result = missing %}{% endif %}',
      ['Variable "missing" used before assignment in expression "result = missing" on line 1']
    ],
    [
      'else branch',
      '{% if condition %}{% assign result = 10 %}{% else %}{% assign result = missing | times: 2 %}{% endif %}',
      ['Variable "missing" used before assignment in expression "result = missing | times: 2" on line 1']
    ],
    [
      'nested if without prior assignment',
      '{% if outer %}{% if inner %}{% assign result = missing | times: 2 %}{% endif %}{% endif %}',
      ['Variable "missing" used before assignment in expression "result = missing | times: 2" on line 1']
    ],
    [
      'nested for without prior assignment',
      '{% for x in items %}{% for y in items %}{% assign result = missing | times: 2 %}{% endfor %}{% endfor %}',
      ['Variable "missing" used before assignment in expression "result = missing | times: 2" on line 1']
    ]
  ])('reports variables used before assignment in a %s', (_name, source, expected) => {
    expect(checkVariableAssignedBeforeUsed(liquid, source)).toEqual(expected)
  })

  test.each([
    [
      'parseAssign in an outer if',
      '{% if outer %}{% parseAssign safe = 10 %}{% if inner %}{% assign result = safe | times: 2 %}{% endif %}{% endif %}'
    ],
    [
      'assign in an outer if',
      '{% if outer %}{% assign safe = 2 %}{% if inner %}{% assign result = safe | times: 2 %}{% endif %}{% endif %}'
    ],
    [
      'assign in an outer for loop',
      '{% for x in items %}{% assign safe = 2 %}{% for y in items %}{% assign result = safe | times: 2 %}{% endfor %}{% endfor %}'
    ]
  ])('accepts variables established by %s', (_name, source) => {
    expect(checkVariableAssignedBeforeUsed(liquid, source)).toEqual([])
  })

  it('requires a top-level $$answer assignment in computeColumn', () => {
    const invalid = `{% computeColumn table result %}
      {% if yes %}{% assign $$answer = 1 %}{% endif %}
      {% for item in items %}{% assign $$answer = item %}{% endfor %}
      {% unless hidden %}{% assign $$answer = 2 %}{% endunless %}
    {% endcomputeColumn %}`
    expect(checkAtleastOneDynamicTableAssignPresent(liquid, invalid)).toEqual([{
      message: '$$answer is not assigned outside any loops or condition block',
      metadata: { tableName: 'table', columnName: 'result' }
    }])

    const answerBeforeBlocks = `{% computeColumn table result %}
      {% assign $$answer = 1 %}
      {% if yes %}{% assign temporary = 2 %}{% endif %}
      {% for item in items %}{% assign temporary = item %}{% endfor %}
    {% endcomputeColumn %}`
    expect(checkAtleastOneDynamicTableAssignPresent(liquid, answerBeforeBlocks)).toEqual([])

    const answerAfterBlocks = `{% computeColumn table result %}
      {% if yes %}{% assign temporary = 2 %}{% endif %}
      {% for item in items %}{% assign temporary = item %}{% endfor %}
      {% assign $$answer = 1 %}
    {% endcomputeColumn %}`
    expect(checkAtleastOneDynamicTableAssignPresent(liquid, answerAfterBlocks)).toEqual([])
  })
})
