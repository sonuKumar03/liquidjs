import {
  checkForCyclicDependency,
  createDependencyTree,
  createEngine,
  getAffectedVariables,
  getAssignedVariables,
  getTemplates,
  parseAssign
} from './dependency-graph'

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

  test.each([
    ['{% assign total = price | divided_by: 100.00 %}', 'total', ['price']],
    ['{% assign output = first | append: second %}', 'output', ['first', 'second']],
    ['{% assign output = source %}', 'output', ['source']]
  ])('parses assignment dependencies from %s', (source, defined, dependsOn) => {
    const engine = createEngine()
    expect(parseAssign(getTemplates(source, engine)[0], engine)).toEqual({ defined, dependsOn })
  })

  it('builds a complete graph across if/else and unless branches', () => {
    const graph = createDependencyTree(`
      {% if condition %}
        {% assign c = a | times: b %}
        {% assign d = c | divided_by: 100 %}
        {% assign result = a | minus: d %}
      {% else %}
        {% assign h = a | minus: i %}
        {% assign result = h | times: g %}
      {% endif %}
      {% unless public %}
        {% assign total = result | plus: fees %}
      {% else %}
        {% assign total = result | plus: tax %}
      {% endunless %}`)
    expect(Object.keys(graph)).toHaveLength(10)
    expect(graph.a).toEqual(['c', 'result', 'h'])
    expect(graph.result).toEqual(['total'])
    expect(getAffectedVariables(graph, 'a')).toEqual(expect.arrayContaining(['c', 'd', 'result', 'h', 'total']))
  })

  it('handles acyclic, self-cyclic, and multi-node cyclic graphs', () => {
    expect(checkForCyclicDependency(createDependencyTree(`
      {% assign x = a | plus: t %}
      {% assign y = a | times: t %}
      {% assign z = p | times: 3 %}
      {% assign p = q | times: 3 %}`))).toEqual([])

    expect(checkForCyclicDependency(createDependencyTree('{% assign x = x | plus: z %}')))
      .toEqual(['x', 'x'])

    expect(checkForCyclicDependency(createDependencyTree(`
      {% assign x = a | plus: z %}
      {% assign z = p | times: 3 %}
      {% assign p = q | times: 3 %}
      {% assign q = r | times: x %}`))).toEqual(['x', 'z', 'p', 'q', 'x'])
  })

  it('discovers all custom assignment tags inside control flow', () => {
    const source = `
      {% assign root = input %}
      {% if condition %}
        {% parseAssign parsed = "100" %}
      {% elsif other %}
        {% assignVar indirect = variableName %}
      {% else %}
        {% assign fallback = input %}
      {% endif %}
      {% unless hidden %}{% assign visible = root %}{% endunless %}
      {% for row in rows %}{% assign item = row.value %}{% endfor %}`
    expect(getAssignedVariables(source)).toEqual([
      'root', 'parsed', 'indirect', 'fallback', 'visible', 'item'
    ])
  })
})
