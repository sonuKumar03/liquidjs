import { Arguments, Value } from '../template'
import { Context } from '../context'
import { IdentifierToken, TagToken, TopLevelToken, FilteredValueToken } from '../tokens'
import { Liquid } from '../liquid'
import { Tag } from '../template/tag'

export default class ParseAssignTag extends Tag {
  public readonly identifier: IdentifierToken
  public readonly key: string
  public readonly value: Value
  public readonly valueToken: FilteredValueToken

  constructor (token: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(token, remainTokens, liquid)
    this.identifier = this.tokenizer.readIdentifier()
    this.key = this.identifier.content
    this.tokenizer.assert(this.key, 'expected variable name')
    this.tokenizer.skipBlank()
    this.tokenizer.assert(this.tokenizer.peek() === '=', 'expected "="')
    this.tokenizer.advance()
    const valueToken = this.tokenizer.readFilteredValue()
    this.valueToken = valueToken
    this.value = new Value(valueToken, liquid)
  }


  * render (ctx: Context): Generator<unknown, void, unknown> {
    const value = yield this.value.value(ctx)
    ctx.bottom()[this.key] = JSON.parse(`{"value": ${String(value)}}`).value
  }

  public * arguments (): Arguments { yield this.value }
  public * localScope (): Iterable<IdentifierToken> { yield this.identifier }
}
