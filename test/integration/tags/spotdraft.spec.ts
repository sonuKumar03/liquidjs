import { Liquid } from '../../../src'

describe('SpotDraft tags', () => {
  it('parseAssign parses JSON scalar, array, and object values', async () => {
    const liquid = new Liquid()
    const template = `
      {% parseAssign text='"bar"' %}
      {% parseAssign count=35 %}
      {% parseAssign enabled=false %}
      {% parseAssign values="[100,200,300]" %}
      {% parseAssign object='{"x": 100, "y": "bar"}' %}
      {{ text }}__{{ count }}__{{ enabled }}__{{ values[1] }}__{{ object.y }}`
    await expect(liquid.parseAndRender(template)).resolves.toContain('bar__35__false__200__bar')
  })

  it('parseAssign rejects invalid JSON', async () => {
    await expect(new Liquid().parseAndRender("{% parseAssign value='{prop: 123}' %}")).rejects.toThrow()
  })

  it('parseAssign rejects an illegal assignment expression', async () => {
    await expect(new Liquid().parseAndRender('{% parseAssign / %}')).rejects.toThrow()
  })

  it('assignVar assigns the value referenced by a variable name', async () => {
    const liquid = new Liquid({ keepOutputType: true })
    await expect(liquid.parseAndRender('{% assignVar result="source" %}{{ result }}', { source: [1, 2, 3] }))
      .resolves.toEqual([1, 2, 3])
  })

  it('assignVar resolves a string variable name from the context', async () => {
    await expect(new Liquid().parseAndRender('{% assignVar result="source" %}{{ result }}', { source: 'bar' }))
      .resolves.toBe('bar')
  })

  it('assignVar rejects an illegal assignment expression', async () => {
    await expect(new Liquid().parseAndRender('{% assignVar / %}')).rejects.toThrow()
  })

  it('computeColumn computes each row and isolates temporary assignments', async () => {
    const liquid = new Liquid()
    const context = { dynamicTable: [{ col1: 2, col2: 3 }, { col1: 1, col2: 4 }], someOtherVariable: 10 }
    const template = `{% computeColumn dynamicTable col3 %}
      {% assign someOtherVariable = 100 %}
      {% assign total = self.col1 | plus: self.col2 %}
      {% assign $$answer = total | append: ' Per month' %}
    {% endcomputeColumn %}`
    await liquid.parseAndRender(template, context)
    expect(context).toEqual({
      dynamicTable: [{ col1: 2, col2: 3, col3: '5 Per month' }, { col1: 1, col2: 4, col3: '5 Per month' }],
      someOtherVariable: 10
    })
  })

  it('computeColumn leaves the target undefined when $$answer is absent', async () => {
    const context = { dynamicTable: [{ value: 1 }] }
    await new Liquid().parseAndRender('{% computeColumn dynamicTable result %}{% assign temp = self.value %}{% endcomputeColumn %}', context)
    expect(context.dynamicTable).toEqual([{ value: 1, result: undefined }])
  })
})
