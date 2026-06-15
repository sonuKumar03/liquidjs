import { Liquid } from '../liquid'
import { Template } from '../template'
import { Tokenizer, PropertyAccessToken, ParseAssignTag, ComputeColumnTag } from '../index'
import { getAssignmentParts, getTagToken, getTemplateChildren, getTemplates, parseAssign } from './dependency-graph'

export function isValidPropertyPath (expr: string): boolean {
  try {
    const tokenizer = new Tokenizer(expr)
    tokenizer.skipBlank()
    const value = tokenizer.readValue()
    if (!value) return false
    tokenizer.skipBlank()
    return tokenizer.end() && value instanceof PropertyAccessToken
  } catch (_) {
    return false
  }
}


export interface JsonValidationError {
  expression: string;
  errorMessage: string;
}

export interface ComputeColumnValidationError {
  message: string;
  metadata: { tableName?: string, columnName?: string };
}

function isLiteral (value: string): boolean {
  return /^(?:-?\d+(?:\.\d+)?|true|false|null)$/.test(value) ||
    (/^(['"])[\s\S]*\1$/.test(value))
}

export function checkValidJSON (engine: Liquid, expression: string): JsonValidationError[] {
  const errors: JsonValidationError[] = []
  
  function visit (templates: Template[]) {
    for (const template of templates) {
      const token = getTagToken(template)
      if (!token) continue
      if (token.name === 'parseAssign') {
        const equalsPos = token.args.indexOf('=')
        const defined = equalsPos >= 0 ? token.args.slice(0, equalsPos).trim() : ''
        const rhs = equalsPos >= 0 ? token.args.slice(equalsPos + 1).trim() : ''



        try {
          if (!isLiteral(rhs)) throw new Error('Invalid value assigned to parseAssign statement')
          const value = engine.evalValueSync(rhs, {})
          JSON.parse(`{"value": ${typeof value === 'string' ? JSON.stringify(value) : String(value)}}`)
        } catch (error) {
          const line = token.line
          errors.push({
            expression: `parseAssign ${defined} =  ${rhs}`,
            errorMessage: `${(error as Error).message} at line ${line}`
          })
        }
      } else {
        visit(getTemplateChildren(template))
      }
    }
  }

  try {
    const templates = engine.parser.parseResilient(expression).templates
    visit(templates)
  } catch (e) {}
  return errors
}

export function checkVariableAssignedBeforeUsed (engine: Liquid, expression: string): string[] {
  const errors: string[] = []
  const assigned = new Set<string>()
  function visit (templates: Template[], scope: Set<string>) {
    for (const template of templates) {
      const token = getTagToken(template)
      if (!token) continue
      if (token.name === 'if' || token.name === 'unless') {
        const branchScope = new Set(scope)
        try {
          for (const variable of engine.variablesSync(`{{ ${token.args} }}`)) branchScope.add(variable)
        } catch (_) {}
        visit(getTemplateChildren(template), branchScope)
      } else if (token.name === 'for') {
        visit(getTemplateChildren(template), new Set(scope))
      } else if (token.name === 'assign' || token.name === 'parseAssign') {
        const dependency = parseAssign(template, engine)
        const missing = dependency.dependsOn.filter(variable => !scope.has(variable))
        const [line] = token.getPosition()
        for (const variable of missing) {
          errors.push(`Variable "${variable}" used before assignment in expression "${token.args}" on line ${line}`)
        }
        if (!missing.length) {
          scope.add(dependency.defined)
          assigned.add(dependency.defined)
        }
      }
    }
  }
  visit(getTemplates(expression, engine), assigned)
  return errors
}

export function checkAtleastOneDynamicTableAssignPresent (engine: Liquid, expression: string): ComputeColumnValidationError[] {
  const errors: ComputeColumnValidationError[] = []
  function visit (templates: Template[]) {
    for (const template of templates) {
      const token = getTagToken(template)
      if (!token) continue
      if (token.name === 'computeColumn') {
        const hasAnswer = getTemplateChildren(template).some(child => {
          const childToken = getTagToken(child)
          return childToken?.name === 'assign' && getAssignmentParts(child)?.defined === '$$answer'
        })
        if (!hasAnswer) {
          errors.push({
            message: '$$answer is not assigned outside any loops or condition block',
            metadata: {
              tableName: (template as any).table.content,
              columnName: (template as any).column.content
            }
          })
        }
      } else if (['if', 'unless', 'for'].includes(token.name)) {
        visit(getTemplateChildren(template))
      }
    }
  }
  try {
    const templates = engine.parser.parseResilient(expression).templates
    visit(templates)
  } catch (_) {}
  return errors
}
