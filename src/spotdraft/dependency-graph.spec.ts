import { createDependencyTree, getAffectedVariables, getAssignedVariables, checkForCyclicDependency } from './dependency-graph'

describe('SpotDraft dependency graph compatibility', () => {
  it('builds dependencies through nested control flow', () => {
    const graph = createDependencyTree(`
      {% assign x = a | plus: z %}
      {% if condition %}{% assign y = x | times: 2 %}{% endif %}
      {% for row in rows %}{% assign z = y | plus: row.value %}{% endfor %}`)
    expect(graph.a).toEqual(['x'])
    expect(graph.z).toEqual(['x'])
    expect(graph.x).toEqual(['y'])
    expect(getAffectedVariables(graph, 'a')).toEqual(['x', 'y', 'z'])
  })

  it('detects cycles and assigned variables', () => {
    const source = `
      {% assign x = z %}
      {% assign z = p %}
      {% assign p = x %}
      {% parseAssign object = '{"value": 1}' %}`
    expect(checkForCyclicDependency(createDependencyTree(source))).toEqual(['z', 'p', 'x', 'z'])
    expect(getAssignedVariables(source)).toEqual(['x', 'z', 'p', 'object'])
  })
})
