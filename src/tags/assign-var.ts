import { Arguments, Value } from '../template'
import { Context } from '../context'
import { IdentifierToken, TagToken, TopLevelToken } from '../tokens'
import { Liquid } from '../liquid'
import { Tag } from '../template/tag'

export default class AssignVarTag extends Tag {
  private readonly identifier: IdentifierToken
  private readonly key: string
  private readonly value: Value

  constructor (token: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(token, remainTokens, liquid)
    this.identifier = this.tokenizer.readIdentifier()
    this.key = this.identifier.content
    this.tokenizer.assert(this.key, 'expected variable name')
    this.tokenizer.skipBlank()
    this.tokenizer.assert(this.tokenizer.peek() === '=', 'expected "="')
    this.tokenizer.advance()
    this.value = new Value(this.tokenizer.readFilteredValue(), liquid)
  }

  * render (ctx: Context): Generator<unknown, void, unknown> {
    const variableName = yield this.value.value(ctx)
    ctx.bottom()[this.key] = ctx.getSync([String(variableName)])
  }

  public * arguments (): Arguments { yield this.value }
  public * localScope (): Iterable<IdentifierToken> { yield this.identifier }
}
