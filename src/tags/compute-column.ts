import { Context } from '../context'
import { Liquid } from '../liquid'
import { Parser } from '../parser'
import { Tag, Template } from '../template'
import { IdentifierToken, TagToken, TopLevelToken } from '../tokens'
import { isTagToken } from '../util'

export default class ComputeColumnTag extends Tag {
  public readonly table: IdentifierToken
  public readonly column: IdentifierToken
  public readonly templates: Template[] = []


  constructor (token: TagToken, remainTokens: TopLevelToken[], liquid: Liquid, parser: Parser) {
    super(token, remainTokens, liquid)
    this.table = this.tokenizer.readIdentifier()
    this.column = this.tokenizer.readIdentifier()
    this.tokenizer.skipBlank()
    this.tokenizer.assert(this.table.size() && this.column.size() && this.tokenizer.end(), 'expected table and column names')
    while (remainTokens.length) {
      const next = remainTokens.shift()!
      if (isTagToken(next) && next.name === 'endcomputeColumn') return
      this.templates.push(parser.parseToken(next, remainTokens))
    }
    throw new Error(`tag ${token.getText()} not closed`)
  }

  * render (ctx: Context): Generator<unknown, void, unknown> {
    const table = ctx.getSync([this.table.content])
    if (!Array.isArray(table)) throw this.tokenizer.error(`${this.table.content} is not an array`)
    for (let index = 0; index < table.length; index++) {
      const rowContext = ctx.spawn(ctx.getAll())
      rowContext.bottom().self = table[index]
      rowContext.bottom().$$answer = undefined
      yield this.liquid.renderer.renderTemplates(this.templates, rowContext)
      table[index] = { ...table[index], [this.column.content]: rowContext.getSync(['$$answer']) }
    }
  }

  public * children (): Generator<unknown, Template[]> { return this.templates }
}
