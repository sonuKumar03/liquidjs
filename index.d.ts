declare module 'liquidjs' {
  export enum TokenKind {
    HTML = 16,
    Output = 8,
    Tag = 4
  }

  export class Token {
    type: string;
    kind: TokenKind;
    raw: string;
    value: string;
    line: number;
    begin: number;
    end: number;
    constructor(type: string, raw: string, value: string, line: number, begin: number, end: number);
    getText(): string;
  }

  export class TagToken extends Token {
    name: string;
    args: string;
    constructor(raw: string, value: string, line: number, begin: number, end: number, name: string, args: string);
  }

  export class Tokenizer {
    text: string;
    options: any;
    constructor(text: string, options?: any);
    readTopLevelTokens(): Token[];
  }

  /**
   * A parsed filter on an output expression, e.g. `| plus: 2`.
   * Produced by `Liquid.parser.parseValue(...)`.
   */
  export interface FilterTemplate {
    name: string;
    /** Raw filter arguments, each kept as a source string (quoted literals preserved). */
    args: string[];
    filter: (...args: any[]) => any;
  }

  /** Parsed output expression, e.g. `{{ price | plus: 2 }}`. */
  export interface ValueTemplate {
    type: 'value';
    /** The base value the filters operate on, e.g. `price`. */
    initial: string;
    filters: FilterTemplate[];
    token?: Token;
  }

  /**
   * Parsed tag template, e.g. `{% assign x = 1 %}` or an `{% if %}` block.
   * `tagImpl` shape varies per tag (branches for `if`, templates for `for`,
   * `key`/`value` for `assign`/`parseAssign`, etc.).
   */
  export interface TagTemplate {
    type: 'tag';
    name: string;
    token: TagToken;
    tagImpl: any;
    render(scope: any): Promise<string>;
  }

  export type Template = ValueTemplate | TagTemplate | Token;

  /**
   * The per-engine parser. Reachable at runtime via `engine.parser`.
   * Build tokens with `Tokenizer.readTopLevelTokens()`, then parse them.
   */
  export interface LiquidParser {
    parse(tokens: Token[]): Template[];
    parseToken(token: Token, tokens: Token[]): Template;
    parseTag(token: Token, tokens: Token[]): TagTemplate | Token;
    /** Parse a single output expression string into its base value + filters. */
    parseValue(str: string): ValueTemplate;
    parseStream(tokens: Token[]): any;
  }

  /**
   * The shared lexical grammar (regexes + helpers) the tokenizer and parser
   * rely on. Reachable at runtime via the default export, e.g. `liquidjs.lexical`.
   */
  export interface Lexical {
    quoted: RegExp;
    number: RegExp;
    bool: RegExp;
    literal: RegExp;
    filter: RegExp;
    integer: RegExp;
    hash: RegExp;
    hashCapture: RegExp;
    range: RegExp;
    rangeCapture: RegExp;
    identifier: RegExp;
    value: RegExp;
    quoteBalanced: RegExp;
    operators: RegExp[];
    quotedLine: RegExp;
    numberLine: RegExp;
    boolLine: RegExp;
    rangeLine: RegExp;
    literalLine: RegExp;
    filterLine: RegExp;
    tagLine: RegExp;
    isLiteral(str: string): boolean;
    isVariable(str: string): boolean;
    isInteger(str: string): boolean;
    isRange(str: string): boolean;
    matchValue(str: string): RegExpExecArray | null;
    parseLiteral(str: string): string | number | boolean;
  }

  export interface LiquidOptions {
    root?: string[];
    cache?: boolean;
    extname?: string;
    dynamicPartials?: boolean;
    trim_tag_right?: boolean;
    trim_tag_left?: boolean;
    trim_value_right?: boolean;
    trim_value_left?: boolean;
    greedy?: boolean;
    strict_filters?: boolean;
    strict_variables?: boolean;
  }

  export interface Liquid {
    options: LiquidOptions;
    /** The engine's parser instance, shared with all parse-facing helpers. */
    parser: LiquidParser;
    parse(html: string, filepath?: string): Template[];
    render(tpl: any[], ctx?: any, opts?: any): Promise<string>;
    parseAndRender(html: string, ctx?: any, opts?: any): Promise<string>;
    evalValue(str: string, scope?: any): any;
    registerFilter(name: string, filter: Function): void;
    registerTag(name: string, tag: any): void;
    /** Validates JSON values assigned via `{% parseAssign %}`. */
    checkValidJSON(expression: string): Array<{ expression: string; errorMessage: string }>;
  }

  export interface LiquidErrorTypes {
    ParseError: new (...args: any[]) => Error;
    TokenizationEroor: new (...args: any[]) => Error;
    RenderBreakError: new (...args: any[]) => Error;
    AssertionError: new (...args: any[]) => Error;
  }

  export interface LiquidFactory {
    (options?: LiquidOptions): Liquid;
    Liquid: new (options?: LiquidOptions) => Liquid;
    Tokenizer: typeof Tokenizer;
    Token: typeof Token;
    TagToken: typeof TagToken;
    TokenKind: typeof TokenKind;
    /** Shared lexical grammar (regexes + helpers). */
    lexical: Lexical;
    /** Evaluate a full expression (operators + filters) against a scope. */
    evalExp(exp: string, scope: any): any;
    /** Evaluate a single value/literal/variable against a scope. */
    evalValue(str: string, scope: any): any;
    isTruthy(val: any): boolean;
    isFalsy(val: any): boolean;
    Types: LiquidErrorTypes;
  }

  const factory: LiquidFactory;
  export default factory;
}

declare module 'liquidjs/validations' {
  import { Liquid } from 'liquidjs';

  export interface JsonValidationError {
    expression: string;
    errorMessage: string;
  }

  export interface ComputeColumnError {
    message: string;
    metadata: {
      tableName?: string;
      columnName?: string;
    };
  }

  /** Reports JSON values assigned via `{% parseAssign %}` that fail to parse. */
  export function checkValidJSON(engine: Liquid, expression: string): JsonValidationError[];

  /** Reports variables read before they are assigned (branch-aware). */
  export function checkVariableAssignedBeforeUsed(engine: Liquid, expression: string): string[];

  /** Reports `computeColumn` blocks missing a top-level `$$answer` assignment. */
  export function checkAtleastOneDynamicTableAssignPresent(
    engine: Liquid,
    expression: string,
  ): ComputeColumnError[];
}

declare module 'liquidjs/validations.js' {
  export * from 'liquidjs/validations';
}

declare module 'liquidjs/dependency-graph' {
  import { Liquid, TagTemplate } from 'liquidjs';

  export interface AssignDependency {
    /** The variable this assignment defines. */
    defined: string;
    /** Variables this assignment reads from. */
    dependsOn: string[];
  }

  /** Extracts `{ defined, dependsOn }` for an assign/parseAssign/assignVar template. */
  export function parseAssign(assignTemplate: TagTemplate, engine: Liquid): AssignDependency;

  /** Builds a `baseVar -> [affected vars]` dependency graph for a template string. */
  export function createDependencyTree(text: string): Record<string, string[]>;

  export function getAffectedVariables(tree: Record<string, string[]>, inputVar: string): string[];

  export function getAssignedVariables(expression: string): string[];

  /** Returns the cyclic path if the dependency graph contains a cycle, else []. */
  export function checkForCyclicDependency(graph: Record<string, string[]>): string[];
}

declare module 'liquidjs/dependency-graph.js' {
  export * from 'liquidjs/dependency-graph';
}
