import { FilteredValueToken, TagToken, HTMLToken, HashToken, QuotedToken, LiquidTagToken, OutputToken, ValueToken, Token, RangeToken, FilterToken, TopLevelToken, PropertyAccessToken, OperatorToken, LiteralToken, IdentifierToken, NumberToken } from '../tokens'
import { OperatorHandler } from '../render/operator'
import { LiteralValue, Trie, createTrie, ellipsis, literalValues, TokenizationError, TYPES, QUOTE, BLANK, NUMBER, SIGN, isWord, isString } from '../util'
import { Operators, Expression } from '../render'
import { NormalizedFullOptions, defaultOptions } from '../liquid-options'
import { FilterArg } from './filter-arg'
import { whiteSpaceCtrl } from './whitespace-ctrl'
import { isPropertyAccessToken, isRangeToken, isTagToken, isOutputToken } from '../util/type-guards'
import { TokenKind } from './token-kind'


export class Tokenizer {
  p: number
  N: number
  private rawBeginAt = -1
  private opTrie: Trie<OperatorHandler>
  private literalTrie: Trie<LiteralValue>

  constructor (
    public input: string,
    operators: Operators | NormalizedFullOptions = defaultOptions.operators,
    public file?: string,
    range?: [number, number]
  ) {
    this.p = range ? range[0] : 0
    this.N = range ? range[1] : input.length
    const optionOperators = (operators as NormalizedFullOptions).operators
    const operatorMap = optionOperators && typeof optionOperators === 'object'
      ? optionOperators
      : operators as Operators
    this.opTrie = createTrie(operatorMap)
    this.literalTrie = createTrie(literalValues)
  }

  public get text (): string {
    return this.input
  }

  readExpression () {
    return new Expression(this.readExpressionTokens())
  }

  * readExpressionTokens (): IterableIterator<Token> {
    const tokens: Token[] = []
    while (this.p < this.N) {
      const operator = this.readOperator()
      if (operator) {
        tokens.push(operator)
        continue
      }
      const operand = this.readValue()
      if (operand) {
        tokens.push(operand)
        continue
      }
      break
    }
    yield * normalizeTokens(tokens, this.input, this.file)
  }
  readOperator (): OperatorToken | undefined {
    this.skipBlank()
    const end = this.matchTrie(this.opTrie)
    if (end === -1) return
    return new OperatorToken(this.input, this.p, (this.p = end), this.file)
  }
  matchTrie<T> (trie: Trie<T>) {
    let node: Trie<T> = trie
    let i = this.p
    let info: Trie<T> | undefined
    while ((node as Trie<T>)[this.input[i]] && i < this.N) {
      node = (node as Trie<T>)[this.input[i++]] as Trie<T>
      if (node['end']) info = node
    }
    if (!info) return -1
    if (info['needBoundary'] && isWord(this.peek(i - this.p))) return -1
    return i
  }
  readFilteredValue (): FilteredValueToken {
    const begin = this.p
    const initial = this.readExpression()
    this.assert(initial.valid(), `invalid value expression: ${this.snapshot()}`)
    const filters = this.readFilters()
    return new FilteredValueToken(initial, filters, this.input, begin, this.p, this.file)
  }
  readFilters (): FilterToken[] {
    const filters = []
    while (true) {
      const filter = this.readFilter()
      if (!filter) return filters
      filters.push(filter)
    }
  }
  readFilter (): FilterToken | null {
    this.skipBlank()
    if (this.end()) return null
    this.assert(this.read() === '|', `expected "|" before filter`)
    const name = this.readIdentifier()
    if (!name.size()) {
      this.assert(this.end(), `expected filter name`)
      return null
    }
    const args = []
    this.skipBlank()
    if (this.peek() === ':') {
      do {
        ++this.p
        const arg = this.readFilterArg()
        arg && args.push(arg)
        this.skipBlank()
        this.assert(this.end() || this.peek() === ',' || this.peek() === '|', () => `unexpected character ${this.snapshot()}`)
      } while (this.peek() === ',')
    } else if (this.peek() === '|' || this.end()) {
      // do nothing
    } else {
      throw this.error('expected ":" after filter name')
    }
    return new FilterToken(name.getText(), args, this.input, name.begin, this.p, this.file)
  }

  readFilterArg (): FilterArg | undefined {
    const key = this.readValue()
    if (!key) return
    this.skipBlank()
    if (this.peek() !== ':') return key
    ++this.p
    const value = this.readValue()
    return [key.getText(), value]
  }

  readTopLevelTokens (options: NormalizedFullOptions = defaultOptions): TopLevelToken[] {
    const tokens: TopLevelToken[] = []
    while (this.p < this.N) {
      const token = this.readTopLevelToken(options)
      tokens.push(token)
    }
    whiteSpaceCtrl(tokens, options)
    return tokens
  }

  readTopLevelToken (options: NormalizedFullOptions): TopLevelToken {
    const { tagDelimiterLeft, outputDelimiterLeft } = options
    if (this.rawBeginAt > -1) return this.readEndrawOrRawContent(options)
    if (this.match(tagDelimiterLeft)) return this.readTagToken(options)
    if (this.match(outputDelimiterLeft)) return this.readOutputToken(options)
    return this.readHTMLToken([tagDelimiterLeft, outputDelimiterLeft])
  }

  readHTMLToken (stopStrings: string[]): HTMLToken {
    const begin = this.p
    while (this.p < this.N) {
      if (stopStrings.some(str => this.match(str))) break
      ++this.p
    }
    return new HTMLToken(this.input, begin, this.p, this.file)
  }

  readTagToken (options: NormalizedFullOptions): TagToken {
    const { file, input } = this
    const begin = this.p
    if (this.readToDelimiter(options.tagDelimiterRight) === -1) {
      throw this.error(`tag ${this.snapshot(begin)} not closed`, begin)
    }
    const token = new TagToken(input, begin, this.p, options, file)
    if (token.name === 'raw') this.rawBeginAt = begin
    return token
  }

  readToDelimiter (delimiter: string, respectQuoted = false) {
    this.skipBlank()
    while (this.p < this.N) {
      if (respectQuoted && (this.peekType() & QUOTE)) {
        this.readQuoted()
        continue
      }
      ++this.p
      if (this.rmatch(delimiter)) return this.p
    }
    return -1
  }

  readOutputToken (options: NormalizedFullOptions = defaultOptions): OutputToken {
    const { file, input } = this
    const { outputDelimiterRight } = options
    const begin = this.p
    if (this.readToDelimiter(outputDelimiterRight, true) === -1) {
      throw this.error(`output ${this.snapshot(begin)} not closed`, begin)
    }
    return new OutputToken(input, begin, this.p, options, file)
  }

  readEndrawOrRawContent (options: NormalizedFullOptions): HTMLToken | TagToken {
    const { tagDelimiterLeft, tagDelimiterRight } = options
    const begin = this.p
    let leftPos = this.readTo(tagDelimiterLeft) - tagDelimiterLeft.length
    while (this.p < this.N) {
      if (this.readIdentifier().getText() !== 'endraw') {
        leftPos = this.readTo(tagDelimiterLeft) - tagDelimiterLeft.length
        continue
      }
      while (this.p <= this.N) {
        if (this.rmatch(tagDelimiterRight)) {
          const end = this.p
          if (begin === leftPos) {
            this.rawBeginAt = -1
            return new TagToken(this.input, begin, end, options, this.file)
          } else {
            this.p = leftPos
            return new HTMLToken(this.input, begin, leftPos, this.file)
          }
        }
        if (this.rmatch(tagDelimiterLeft)) break
        this.p++
      }
    }
    throw this.error(`raw ${this.snapshot(this.rawBeginAt)} not closed`, begin)
  }

  readLiquidTagTokens (options: NormalizedFullOptions = defaultOptions): LiquidTagToken[] {
    const tokens: LiquidTagToken[] = []
    while (this.p < this.N) {
      const token = this.readLiquidTagToken(options)
      token && tokens.push(token)
    }
    return tokens
  }

  readLiquidTagToken (options: NormalizedFullOptions): LiquidTagToken | undefined {
    this.skipBlank()
    if (this.end()) return

    const begin = this.p
    this.readToDelimiter('\n')
    const end = this.p
    return new LiquidTagToken(this.input, begin, end, options, this.file)
  }

  error (msg: string, pos: number = this.p) {
    return new TokenizationError(msg, new IdentifierToken(this.input, pos, this.N, this.file))
  }

  assert (pred: unknown, msg: string | (() => string), pos?: number) {
    if (!pred) throw this.error(typeof msg === 'function' ? msg() : msg, pos)
  }

  snapshot (begin: number = this.p) {
    return JSON.stringify(ellipsis(this.input.slice(begin, this.N), 32))
  }

  /**
   * @deprecated use #readIdentifier instead
   */
  readWord () {
    return this.readIdentifier()
  }

  readIdentifier (): IdentifierToken {
    this.skipBlank()
    const begin = this.p
    while (!this.end() && isWord(this.peek())) ++this.p
    return new IdentifierToken(this.input, begin, this.p, this.file)
  }

  readNonEmptyIdentifier (): IdentifierToken | undefined {
    const id = this.readIdentifier()
    return id.size() ? id : undefined
  }

  readTagName (): string {
    this.skipBlank()
    // Handle inline comment tags
    if (this.input[this.p] === '#') return this.input.slice(this.p, ++this.p)
    return this.readIdentifier().getText()
  }

  readHashes (jekyllStyle?: boolean | string) {
    const hashes = []
    while (true) {
      const hash = this.readHash(jekyllStyle)
      if (!hash) return hashes
      hashes.push(hash)
    }
  }

  readHash (jekyllStyle?: boolean | string): HashToken | undefined {
    this.skipBlank()
    if (this.peek() === ',') ++this.p
    const begin = this.p
    const name = this.readNonEmptyIdentifier()
    if (!name) return
    let value

    this.skipBlank()
    const sep = isString(jekyllStyle) ? jekyllStyle : (jekyllStyle ? '=' : ':')
    if (this.peek() === sep) {
      ++this.p
      value = this.readValue()
    }
    return new HashToken(this.input, begin, this.p, name, value, this.file)
  }

  remaining () {
    return this.input.slice(this.p, this.N)
  }

  advance (step = 1) {
    this.p += step
  }

  end () {
    return this.p >= this.N
  }
  read () {
    return this.input[this.p++]
  }
  readTo (end: string): number {
    while (this.p < this.N) {
      ++this.p
      if (this.rmatch(end)) return this.p
    }
    return -1
  }

  readValue (): ValueToken | undefined {
    this.skipBlank()
    const begin = this.p
    const variable = this.readLiteral() || this.readQuoted() || this.readRange() || this.readNumber()
    const props = this.readProperties(!variable)
    if (!props.length) return variable
    return new PropertyAccessToken(variable, props, this.input, begin, this.p)
  }

  readScopeValue (): ValueToken | undefined {
    this.skipBlank()
    const begin = this.p
    const props = this.readProperties()
    if (!props.length) return undefined
    return new PropertyAccessToken(undefined, props, this.input, begin, this.p)
  }

  private readProperties (isBegin = true): (ValueToken | IdentifierToken)[] {
    const props: (ValueToken | IdentifierToken)[] = []
    while (true) {
      if (this.peek() === '[') {
        this.p++
        const prop = this.readValue() || new IdentifierToken(this.input, this.p, this.p, this.file)
        this.assert(this.readTo(']') !== -1, '[ not closed')
        props.push(prop)
        continue
      }
      if (isBegin && !props.length) {
        const prop = this.readNonEmptyIdentifier()
        if (prop) {
          props.push(prop)
          continue
        }
      }
      if (this.peek() === '.' && this.peek(1) !== '.') { // skip range syntax
        this.p++
        const prop = this.readNonEmptyIdentifier()
        if (!prop) break
        props.push(prop)
        continue
      }
      break
    }
    return props
  }

  readNumber (): NumberToken | undefined {
    this.skipBlank()
    let decimalFound = false
    let digitFound = false
    let n = 0
    if (this.peekType() & SIGN) n++
    while (this.p + n <= this.N) {
      if (this.peekType(n) & NUMBER) {
        digitFound = true
        n++
      } else if (this.peek(n) === '.' && this.peek(n + 1) !== '.') {
        if (decimalFound || !digitFound) return
        decimalFound = true
        n++
      } else break
    }
    if (digitFound && !isWord(this.peek(n))) {
      const num = new NumberToken(this.input, this.p, this.p + n, this.file)
      this.advance(n)
      return num
    }
  }

  readLiteral (): LiteralToken | undefined {
    this.skipBlank()
    const end = this.matchTrie(this.literalTrie)
    if (end === -1) return
    const literal = new LiteralToken(this.input, this.p, end, this.file)
    this.p = end
    return literal
  }

  readRange (): RangeToken | undefined {
    this.skipBlank()
    const begin = this.p
    if (this.peek() !== '(') return
    ++this.p
    const lhs = this.readValueOrThrow()
    this.skipBlank()
    this.assert(this.read() === '.' && this.read() === '.', 'invalid range syntax')
    const rhs = this.readValueOrThrow()
    this.skipBlank()
    this.assert(this.read() === ')', 'invalid range syntax')
    return new RangeToken(this.input, begin, this.p, lhs, rhs, this.file)
  }

  readValueOrThrow (): ValueToken {
    const value = this.readValue()
    this.assert(value, () => `unexpected token ${this.snapshot()}, value expected`)
    return value!
  }

  readQuoted (): QuotedToken | undefined {
    this.skipBlank()
    const begin = this.p
    if (!(this.peekType() & QUOTE)) return
    ++this.p
    let escaped = false
    while (this.p < this.N) {
      ++this.p
      if (this.input[this.p - 1] === this.input[begin] && !escaped) break
      if (escaped) escaped = false
      else if (this.input[this.p - 1] === '\\') escaped = true
    }
    return new QuotedToken(this.input, begin, this.p, this.file)
  }

  * readFileNameTemplate (options: NormalizedFullOptions): IterableIterator<TopLevelToken> {
    const { outputDelimiterLeft } = options
    const htmlStopStrings = [',', ' ', '\r', '\n', '\t', outputDelimiterLeft]
    const htmlStopStringSet = new Set(htmlStopStrings)
    // break on ',' and ' ', outputDelimiterLeft only stops HTML token
    while (this.p < this.N && !htmlStopStringSet.has(this.peek())) {
      yield this.match(outputDelimiterLeft)
        ? this.readOutputToken(options)
        : this.readHTMLToken(htmlStopStrings)
    }
  }

  match (word: string) {
    for (let i = 0; i < word.length; i++) {
      if (word[i] !== this.input[this.p + i]) return false
    }
    return true
  }

  rmatch (pattern: string) {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[pattern.length - 1 - i] !== this.input[this.p - 1 - i]) return false
    }
    return true
  }

  peekType (n = 0) {
    return this.p + n >= this.N ? 0 : TYPES[this.input.charCodeAt(this.p + n)]
  }

  peek (n = 0): string {
    return this.p + n >= this.N ? '' : this.input[this.p + n]
  }

  skipBlank () {
    while (this.peekType() & BLANK) ++this.p
  }
}

function collectValueTokenSubTokens (token: Token, list: Token[]) {
  list.push(token)
  if (isPropertyAccessToken(token)) {
    if (token.variable) collectValueTokenSubTokens(token.variable, list)
    for (const prop of token.props) {
      collectValueTokenSubTokens(prop, list)
    }
  } else if (isRangeToken(token)) {
    collectValueTokenSubTokens(token.lhs, list)
    collectValueTokenSubTokens(token.rhs, list)
  }
}

function tokenizeTagArgs (token: TagToken, operators: Operators): Token[] {
  const argsBegin = token.contentRange[1] - token.args.length
  const tokenizer = new Tokenizer(token.input, operators, token.file, [argsBegin, token.contentRange[1]])
  const tokens: Token[] = []
  while (!tokenizer.end()) {
    tokenizer.skipBlank()
    if (tokenizer.end()) break

    const op = tokenizer.readOperator()
    if (op) {
      tokens.push(op)
      continue
    }

    const hash = tokenizer.readHash()
    if (hash) {
      if (hash.name) tokens.push(hash.name)
      if (hash.value) collectValueTokenSubTokens(hash.value, tokens)
      continue
    }

    if (tokenizer.peek() === '|') {
      tokenizer.p++
      const name = tokenizer.readIdentifier()
      if (name.size()) tokens.push(name)
      continue
    }

    const val = tokenizer.readValue()
    if (val) {
      collectValueTokenSubTokens(val, tokens)
      continue
    }

    tokenizer.p++
  }
  return tokens
}

function tokenizeOutputToken (token: OutputToken, operators: Operators): Token[] {
  const tokenizer = new Tokenizer(token.input, operators, token.file, token.contentRange)
  const tokens: Token[] = []
  try {
    const filteredValue = tokenizer.readFilteredValue()
    if (filteredValue.initial) {
      for (const t of filteredValue.initial.postfix) {
        collectValueTokenSubTokens(t, tokens)
      }
    }
    for (const filter of filteredValue.filters) {
      const nameToken = new IdentifierToken(token.input, filter.begin, filter.begin + filter.name.length, token.file)
      tokens.push(nameToken)
      for (const arg of filter.args) {
        if (Array.isArray(arg)) {
          if (arg[1]) collectValueTokenSubTokens(arg[1], tokens)
        } else if (arg) {
          collectValueTokenSubTokens(arg, tokens)
        }
      }
    }
  } catch (_) {}
  return tokens
}

export function getTokenAtPosition (
  tokens: TopLevelToken[],
  position: number,
  operators: Operators = defaultOptions.operators
): Token | undefined {
  for (const token of tokens) {
    if (position >= token.begin && position <= token.end) {
      if (isTagToken(token)) {
        const tagNameToken = new IdentifierToken(token.input, token.begin + 2, token.begin + 2 + token.name.length, token.file)
        if (position >= tagNameToken.begin && position <= tagNameToken.end) {
          return tagNameToken
        }
        const subTokens = tokenizeTagArgs(token, operators)
        for (const sub of subTokens) {
          if (position >= sub.begin && position <= sub.end) {
            return sub
          }
        }
        return token
      } else if (isOutputToken(token)) {
        const subTokens = tokenizeOutputToken(token, operators)
        for (const sub of subTokens) {
          if (position >= sub.begin && position <= sub.end) {
            return sub
          }
        }
        return token
      }
      return token
    }
  }
  return undefined
}

function normalizeTokens (tokens: Token[], input: string, file?: string): Token[] {
  const normalized: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const text = token.getText()

    // 1. Decrement Splitting (a--)
    if (text.endsWith('--') && (token.kind === TokenKind.Word || token.kind === TokenKind.PropertyAccess)) {
      if (token instanceof IdentifierToken) {
        const valToken = new IdentifierToken(input, token.begin, token.end - 2, file)
        const op1 = new OperatorToken(input, token.end - 2, token.end - 1, file)
        const op2 = new OperatorToken(input, token.end - 1, token.end, file)
        normalized.push(valToken, op1, op2)
        continue
      } else if (token instanceof PropertyAccessToken) {
        const lastProp = token.props[token.props.length - 1]
        if (lastProp && lastProp.getText().endsWith('--')) {
          let newLastProp: ValueToken | IdentifierToken
          if (lastProp instanceof IdentifierToken) {
            newLastProp = new IdentifierToken(input, lastProp.begin, lastProp.end - 2, file)
          } else {
            newLastProp = lastProp
          }
          const newProps = [...token.props.slice(0, -1), newLastProp]
          const valToken = new PropertyAccessToken(token.variable, newProps, input, token.begin, token.end - 2, file)
          const op1 = new OperatorToken(input, token.end - 2, token.end - 1, file)
          const op2 = new OperatorToken(input, token.end - 1, token.end, file)
          normalized.push(valToken, op1, op2)
          continue
        }
      }
    }

    // 2. Unary/Binary Operator Separation (a | +2 or a -2)
    if ((text.startsWith('+') || text.startsWith('-')) && (token.kind === TokenKind.Number || token.kind === TokenKind.PropertyAccess)) {
      const prev = normalized[normalized.length - 1]
      const isPrecededByValue = prev && (
        prev.kind === TokenKind.Number ||
        prev.kind === TokenKind.Literal ||
        prev.kind === TokenKind.PropertyAccess ||
        prev.kind === TokenKind.Word ||
        prev.kind === TokenKind.Quoted ||
        prev.kind === TokenKind.Range
      )
      if (isPrecededByValue) {
        const op = new OperatorToken(input, token.begin, token.begin + 1, file)
        let remainder: Token
        if (token.kind === TokenKind.Number) {
          remainder = new NumberToken(input, token.begin + 1, token.end, file)
        } else {
          remainder = new IdentifierToken(input, token.begin + 1, token.end, file)
        }
        normalized.push(op, remainder)
        continue
      }
    }

    normalized.push(token)
  }
  return normalized
}

