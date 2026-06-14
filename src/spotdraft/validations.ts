import { Liquid } from '../liquid'
import { Template } from '../template'
import { getAssignmentParts, getTagToken, getTemplateChildren, getTemplates, parseAssign } from './dependency-graph'

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
        const parts = getAssignmentParts(template)
        if (!parts) continue
        try {
          if (!isLiteral(parts.rhs)) throw new Error('Invalid value assigned to parseAssign statement')
          const value = engine.evalValueSync(parts.rhs, {})
          JSON.parse(`{"value": ${typeof value === 'string' ? JSON.stringify(value) : String(value)}}`)
        } catch (error) {
          const [line] = token.getPosition()
          errors.push({
            expression: `${token.name} ${parts.defined} = ${token.args.slice(token.args.indexOf('=') + 1)}`,
            errorMessage: `${(error as Error).message} at line ${line}`
          })
        }
      } else if (['if', 'unless', 'for'].includes(token.name)) visit(getTemplateChildren(template))
    }
  }
  visit(getTemplates(expression, engine))
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
          const [tableName, columnName] = token.args.trim().split(/\s+/)
          errors.push({
            message: '$$answer is not assigned outside any loops or condition block',
            metadata: { tableName, columnName }
          })
        }
      } else if (['if', 'unless', 'for'].includes(token.name)) visit(getTemplateChildren(template))
    }
  }
  visit(getTemplates(expression, engine))
  return errors
}
