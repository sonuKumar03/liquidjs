import { Liquid } from '../liquid'
import { Template } from '../template'
import { TagToken } from '../tokens'
import { toValueSync } from '../util'

export interface AssignDependency {
  defined: string;
  dependsOn: string[];
}

export type DependencyTree = Record<string, string[]>

export function createEngine (): Liquid {
  return new Liquid()
}

export function getTemplates (expression: string, engine: Liquid = createEngine()): Template[] {
  return engine.parse(expression)
}

export function getTagToken (template: Template): TagToken | undefined {
  return template.token instanceof TagToken ? template.token : undefined
}

export function getAssignmentParts (template: Template): { defined: string, rhs: string } | undefined {
  const token = getTagToken(template)
  if (!token || !['assign', 'parseAssign', 'assignVar'].includes(token.name)) return
  const equals = token.args.indexOf('=')
  if (equals < 0) return
  return { defined: token.args.slice(0, equals).trim(), rhs: token.args.slice(equals + 1).trim() }
}

export function parseAssign (template: Template, engine: Liquid): AssignDependency {
  const parts = getAssignmentParts(template)
  if (!parts) return { defined: '', dependsOn: [] }
  let dependsOn: string[] = []
  try {
    dependsOn = engine.variablesSync(`{{ ${parts.rhs} }}`)
  } catch (_) {}
  return { defined: parts.defined, dependsOn }
}

export function getTemplateChildren (template: Template): Template[] {
  return template.children ? toValueSync(template.children(false, true)) : []
}

function visitAssignments (templates: Template[], callback: (template: Template) => void) {
  for (const template of templates) {
    const token = getTagToken(template)
    if (!token) continue
    if (['assign', 'parseAssign', 'assignVar'].includes(token.name)) callback(template)
    if (['if', 'unless', 'for'].includes(token.name)) visitAssignments(getTemplateChildren(template), callback)
  }
}

export function createDependencyTree (expression: string): DependencyTree {
  const engine = createEngine()
  const graph: DependencyTree = {}
  visitAssignments(getTemplates(expression, engine), template => {
    const dependency = parseAssign(template, engine)
    for (const variable of dependency.dependsOn) {
      const affected = graph[variable] ?? (graph[variable] = [])
      if (!affected.includes(dependency.defined)) affected.push(dependency.defined)
    }
  })
  return graph
}

export function getAffectedVariables (tree: DependencyTree, inputVariable: string): string[] {
  const affected: string[] = []
  const visiting = new Set<string>()
  function visit (variable: string) {
    if (visiting.has(variable)) return
    visiting.add(variable)
    for (const dependent of tree[variable] ?? []) {
      if (dependent !== inputVariable) affected.push(dependent)
      visit(dependent)
    }
    visiting.delete(variable)
  }
  visit(inputVariable)
  return Array.from(new Set(affected))
}

export function checkForCyclicDependency (graph: DependencyTree): string[] {
  const visited = new Set<string>()
  const path: string[] = []
  const pathIndexes = new Map<string, number>()
  function visit (node: string): string[] | undefined {
    const pathIndex = pathIndexes.get(node)
    if (pathIndex !== undefined) return [...path.slice(pathIndex), node].reverse()
    if (visited.has(node)) return
    pathIndexes.set(node, path.length)
    path.push(node)
    for (const neighbour of graph[node] ?? []) {
      const cycle = visit(neighbour)
      if (cycle) return cycle
    }
    path.pop()
    pathIndexes.delete(node)
    visited.add(node)
  }
  for (const node of Object.keys(graph)) {
    const cycle = visit(node)
    if (cycle) return cycle
  }
  return []
}

export function getAssignedVariables (expression: string): string[] {
  const engine = createEngine()
  const assigned: string[] = []
  visitAssignments(getTemplates(expression, engine), template => {
    const defined = parseAssign(template, engine).defined
    if (defined) assigned.push(defined)
  })
  return Array.from(new Set(assigned))
}
