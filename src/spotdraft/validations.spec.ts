import * as fs from 'fs'
import * as path from 'path'
import { Liquid } from '../liquid'
import { checkAtleastOneDynamicTableAssignPresent, checkValidJSON, checkVariableAssignedBeforeUsed, isValidPropertyPath } from './validations'
import { PlaceholderTemplate } from '../template'
import { Tokenizer } from '../parser'



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

  describe('Lexical Normalization & Resilient Parsing', () => {
    function getExpressionTokens(template: any): any[] {
      const token = template.token
      const tokenizer = new Tokenizer(token.input, liquid.options.operators, token.file, token.contentRange)
      return [...tokenizer.readExpressionTokens()]
    }

    it('splits decrements (a--) into identifier and operators', () => {
      const templates = liquid.parser.parse('{{ a-- }}')
      const tokens = getExpressionTokens(templates[0])
      expect(tokens).toHaveLength(3)
      expect(tokens[0].getText()).toBe('a')
      expect(tokens[1].getText()).toBe('-')
      expect(tokens[2].getText()).toBe('-')
    })

    it('splits binary operator sign (a -2) into identifier, operator, and number', () => {
      const templates = liquid.parser.parse('{{ a -2 }}')
      const tokens = getExpressionTokens(templates[0])
      expect(tokens).toHaveLength(3)
      expect(tokens[0].getText()).toBe('a')
      expect(tokens[1].getText()).toBe('-')
      expect(tokens[2].getText()).toBe('2')
    })

    it('does not split negative number at start (-2)', () => {
      const templates = liquid.parser.parse('{{ -2 }}')
      const tokens = getExpressionTokens(templates[0])
      expect(tokens).toHaveLength(1)
      expect(tokens[0].getText()).toBe('-2')
    })

    it('validates property paths using isValidPropertyPath', () => {
      expect(isValidPropertyPath('a.b.c')).toBe(true)
      expect(isValidPropertyPath('a')).toBe(true)
      expect(isValidPropertyPath('a and b')).toBe(false)
      expect(isValidPropertyPath('a | plus: 2')).toBe(false)
      expect(isValidPropertyPath('123')).toBe(false)
    })

    it('parses resiliently without throwing on syntax errors', () => {
      const { templates, errors } = liquid.parser.parseResilient('{% assign a = %} {% assign b = 2 %}')
      expect(templates).toHaveLength(3) // Placeholder, HTML (space), AssignTag
      expect(templates[0]).toBeInstanceOf(PlaceholderTemplate)
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toContain('expression')
    })

    it('exposes begin and end offsets on templates', () => {
      const templates = liquid.parser.parse('  {% assign a = 1 %}  ')
      expect(templates[0].begin).toBe(0) // HTML space
      expect(templates[1].begin).toBe(2) // Assign
      expect(templates[1].end).toBe(20)
    })

    it('passes validation on test.liquid', () => {
      const testContent = fs.readFileSync(path.join(__dirname, '../../test.liquid'), 'utf8')
      const jsonErrors = checkValidJSON(liquid, testContent)
      const varErrors = checkVariableAssignedBeforeUsed(liquid, testContent)
      expect(jsonErrors).toEqual([])
      expect(Array.isArray(varErrors)).toBe(true)
    })

    it('passes validation on test2.liquid', () => {
      const testContent = fs.readFileSync(path.join(__dirname, '../../test2.liquid'), 'utf8')
      const jsonErrors = checkValidJSON(liquid, testContent)
      const varErrors = checkVariableAssignedBeforeUsed(liquid, testContent)
      expect(jsonErrors).toEqual([])
      expect(Array.isArray(varErrors)).toBe(true)
    })
  })
})

