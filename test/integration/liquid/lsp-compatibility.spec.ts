import { Liquid, TokenKind, Tokenizer } from '../../../src'

describe('LSP compatibility surface', () => {
  it('accepts full Liquid options in Tokenizer and exposes legacy token metadata', () => {
    const liquid = new Liquid()
    const tokenizer = new Tokenizer('{% assign answer = input | plus: 1 %}', liquid.options)
    const [token] = tokenizer.readTopLevelTokens(liquid.options)
    expect(tokenizer.text).toContain('assign answer')
    expect(token.kind).toBe(TokenKind.Tag)
    expect(token.type).toBe('tag')
    expect(token.raw).toBe(token.getText())
    expect(token.line).toBe(1)
  })

  it('retains Parser.parseValue for parser-driven consumers', () => {
    const liquid = new Liquid()
    const value = liquid.parser.parseValue('price | plus: tax')
    expect(value.filters.map(filter => filter.name)).toEqual(['plus'])
  })
})
