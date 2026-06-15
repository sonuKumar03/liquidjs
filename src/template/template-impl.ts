import { Token } from '../tokens'

export abstract class TemplateImpl<T extends Token = Token> {
  public token: T;
  public constructor (token: T) {
    this.token = token
  }
  public get begin (): number {
    return this.token.begin
  }
  public get end (): number {
    return this.token.end
  }
}

