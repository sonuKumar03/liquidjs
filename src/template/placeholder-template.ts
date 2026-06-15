import { TemplateImpl, Template } from '../template'
import { Token } from '../tokens'
import { Context } from '../context'
import { Emitter } from '../emitters'

export class PlaceholderTemplate extends TemplateImpl<Token> implements Template {
  public readonly error: Error
  public constructor (token: Token, error: Error) {
    super(token)
    this.error = error
  }
  public * render (ctx: Context, emitter: Emitter): IterableIterator<void> {
    // Placeholder does not emit output
  }
}
