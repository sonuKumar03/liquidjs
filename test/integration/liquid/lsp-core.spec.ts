import {
  Liquid,
  Tokenizer,
  Parser,
  getTokenAtPosition,
  analyzeSync,
  createDependencyTree,
  getAssignedVariables,
  getAffectedVariables,
  TokenKind,
  IdentifierToken,
  OperatorToken
} from '../../../src'

describe('LSP-Core functionality', () => {
  const source = `
{% assign total = price | plus: tax %}
{{ total }}
`

  it('supports tokenizing and parsing documents with source positions', () => {
    const liquid = new Liquid()
    const tokenizer = new Tokenizer(source)
    const tokens = tokenizer.readTopLevelTokens()

    expect(tokens.length).toBe(5) // LF, Tag, LF, Output, LF
    expect(tokens[1].kind).toBe(TokenKind.Tag)
    expect(tokens[1].getText()).toBe('{% assign total = price | plus: tax %}')
    expect(tokens[1].begin).toBe(1)
    expect(tokens[1].end).toBe(39)

    const parser = new Parser(liquid)
    const templates = parser.parseTokens(tokens)
    expect(templates.length).toBe(5)
  })

  it('extracts variables and globals statically', () => {
    const liquid = new Liquid()
    const templates = liquid.parse(source)
    const analysis = analyzeSync(templates)

    // Used variables (globals + locals)
    const variables = Object.keys(analysis.variables)
    expect(variables).toContain('total')
    expect(variables).toContain('price')
    expect(variables).toContain('tax')

    // Global inputs (variables used but not defined in local scope)
    const globals = Object.keys(analysis.globals)
    expect(globals).toContain('price')
    expect(globals).toContain('tax')
    expect(globals).not.toContain('total')
  })

  it('analyzes assignments and dependency chains', () => {
    const tree = createDependencyTree(source)
    expect(tree.price).toContain('total')
    expect(tree.tax).toContain('total')

    const assigned = getAssignedVariables(source)
    expect(assigned).toEqual(['total'])

    const affected = getAffectedVariables(tree, 'price')
    expect(affected).toContain('total')
  })

  it('retrieves detailed nested tokens at specific character positions', () => {
    const liquid = new Liquid()
    const tokens = new Tokenizer(source).readTopLevelTokens()

    // Position of "total" in "assign total =" is 11
    const tokenTotal = getTokenAtPosition(tokens, 11)
    expect(tokenTotal).toBeDefined()
    expect(tokenTotal).toBeInstanceOf(IdentifierToken)
    expect(tokenTotal!.getText()).toBe('total')
    expect(tokenTotal!.begin).toBe(11)
    expect(tokenTotal!.end).toBe(16)

    // Position of "plus" in "| plus:" is 27
    const tokenPlus = getTokenAtPosition(tokens, 27)
    expect(tokenPlus).toBeDefined()
    expect(tokenPlus).toBeInstanceOf(IdentifierToken)
    expect(tokenPlus!.getText()).toBe('plus')

    // Position of "price" in "= price |" is 19
    const tokenPrice = getTokenAtPosition(tokens, 19)
    expect(tokenPrice).toBeDefined()
    expect(tokenPrice).toBeInstanceOf(IdentifierToken)
    expect(tokenPrice!.getText()).toBe('price')

    // Outside tag/output (plain HTML / whitespace) - e.g. position 0
    const tokenWhitespace = getTokenAtPosition(tokens, 0)
    expect(tokenWhitespace).toBeDefined()
    expect(tokenWhitespace!.kind).toBe(TokenKind.HTML)
  })
})
