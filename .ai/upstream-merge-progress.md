# Upstream Merge Progress

## Status

| Status | Task | Notes |
|---|---|---|
| DONE | Fetch current upstream | `upstream/master` at `8a0c74a7f` (LiquidJS 10.27.0 lineage, 2026-06-14) |
| DONE | Measure divergence | Fork is 83 commits ahead and 1,056 commits behind; merge base is `e275368c` |
| DONE | Identify merge strategy | Migrate fork behavior onto upstream TypeScript architecture; do not resolve the 3.x-to-10.x rewrite by blindly choosing conflict sides |
| DONE | Inventory fork-only API surface | Custom filters/operators, tags, dependency graph, validations, tokenizer/parser exports, and TypeScript declarations identified below |
| DONE | Record legacy baseline health | Tests cannot start without dependencies (`mocha: command not found`); legacy lint reports 3,546 errors |
| IN_PROGRESS | Establish upstream codebase on migration branch | Preserve the legacy fork in Git history while making upstream the implementation baseline |
| TODO | Port typed computation and comparison behavior | Currency, duration, date, null/undefined/object arithmetic, precision, defaults, and CommonForm comparisons |
| TODO | Port custom filters | `toCurrency`, `toDuration`, `sumArray`, `updateAttribute`, `updateTypeAttribute`, plus modified arithmetic filters |
| TODO | Port custom tags | `parseAssign`, `assignVar`, and `computeColumn` |
| TODO | Port dependency/static-analysis APIs | Assignment extraction, dependency graph, affected/assigned variables, and cycle detection |
| TODO | Port validations | JSON validation, use-before-assignment, and `computeColumn`/`$$answer` validation |
| TODO | Preserve LSP-facing parser/tokenizer API | Verify whether upstream exports can replace the fork's `Tokenizer`, token kinds, parser access, lexical helpers, and evaluation helpers |
| TODO | Add focused compatibility tests | Port legacy tests to upstream test architecture and add regression cases for migration decisions |
| TODO | Run full validation | Typecheck, lint, unit tests, build, and focused compatibility suite |
| TODO | Produce final migration report | Summarize adopted upstream improvements, preserved behavior, risks, and readiness |

## Divergence Summary

- The fork is based on LiquidJS 3.1-era CommonJS JavaScript; current upstream is LiquidJS 10.x TypeScript.
- Fork-only work touches 50 files with roughly 14,700 insertions, including generated `dist` bundles.
- High-risk files modified by both sides include the filter/operator/parser/tokenizer core and their tests.
- Generated bundles and Shopify rendering/layout compatibility are not migration targets. They will be regenerated from the final source if required by upstream's release workflow.

## Fork-Specific Feature Inventory

### Computation and Types

- CommonForm type detection for date strings, durations, currencies, phone numbers, arrays, objects, null, and undefined.
- Typed equality and ordering for dates, durations, currencies, phone numbers, arrays, and ordinary Liquid values.
- Arithmetic over scalar values and CommonForm objects, including date/duration operations.
- Null/undefined/object fallback behavior and default-value propagation.
- Decimal precision preservation for add/subtract/multiply/divide.

### Filters

- `toCurrency(value, type)` creates a `{ value, type }` currency object.
- `toDuration(value, type)` creates a duration object with normalized type and computed days.
- `sumArray(array, key?, defaultSum?)` sums scalars or an object property.
- `updateAttribute` and `updateTypeAttribute` return updated object copies.
- Existing arithmetic filters are extended for CommonForm values.

### Tags

- `parseAssign`: assigns JSON arrays/objects while allowing Liquid expressions inside the JSON source.
- `assignVar`: resolves an evaluated variable name and assigns its referenced value.
- `computeColumn`: computes a table column per row with `self` and `$$answer`, while isolating temporary assignments.

### Static Analysis and Validation

- Assignment dependency extraction across assign-like tags, conditionals, and loops.
- Dependency tree construction, affected-variable traversal, assigned-variable extraction, and cycle detection.
- Invalid `parseAssign` JSON reporting.
- Branch-aware variable-used-before-assignment reporting.
- Validation that each `computeColumn` has a top-level `$$answer` assignment.

### LSP-Facing Compatibility

- Public tokenizer/token classes and token kind constants.
- Public lexical grammar, truthiness, expression evaluation, parser access, and error types.
- Type declarations for templates, parser/tokenizer APIs, validations, and dependency graph modules.

## Major Decisions

1. Use current upstream as the source architecture because the parser, tokenizer, context, security limits, and TypeScript API have been substantially redesigned.
2. Port business behavior as isolated extensions and compatibility exports instead of retaining legacy core files.
3. Keep validation and dependency analysis parser-based; do not reduce them to regex-only source scanning.
4. Preserve custom behavior even where upstream has similarly named filters or tags until compatibility tests prove equivalence.

## Remaining Risks

- Upstream's expression and template AST shapes differ substantially from the legacy parser templates.
- Some legacy behavior is encoded only in tests and commit history, especially null/default arithmetic semantics.
- The LSP consumer may depend on undocumented parser/token fields beyond the published declarations.
- `computeColumn` mutates table data and scope; upstream `Context` isolation semantics must be tested carefully.

## Verification Log

- 2026-06-15: `npm test` could not run because `node_modules` is absent and `mocha` is unavailable.
- 2026-06-15: `npm run lint` completed with 3,546 pre-existing errors in the legacy fork.
