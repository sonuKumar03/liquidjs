# Upstream Merge Progress

## Status

| Status | Task | Notes |
|---|---|---|
| DONE | Fetch current upstream | `upstream/master` at `8a0c74a7f` (LiquidJS 10.27.0 lineage, 2026-06-14) |
| DONE | Measure divergence | Fork is 83 commits ahead and 1,056 commits behind; merge base is `e275368c` |
| DONE | Identify merge strategy | Migrate fork behavior onto upstream TypeScript architecture; do not resolve the 3.x-to-10.x rewrite by blindly choosing conflict sides |
| DONE | Inventory fork-only API surface | Custom filters/operators, tags, dependency graph, validations, tokenizer/parser exports, and TypeScript declarations identified below |
| DONE | Record legacy baseline health | Tests cannot start without dependencies (`mocha: command not found`); legacy lint reports 3,546 errors |
| DONE | Establish upstream codebase on migration branch | Upstream ancestry recorded; source tree replaced with `upstream/master` while preserving fork history and migration docs |
| DONE | Port typed computation and comparison behavior | CommonForm currency/duration/date arithmetic, null/object handling, precision, and custom comparisons ported to TypeScript |
| DONE | Port custom filters | `toCurrency`, `toDuration`, `sumArray`, `updateAttribute`, `updateTypeAttribute`, and arithmetic overrides registered by default |
| DONE | Port custom tags | `parseAssign`, `assignVar`, and `computeColumn` ported as upstream tag classes with AST hooks and isolated row contexts |
| DONE | Port dependency/static-analysis APIs | Assignment extraction, dependency graph, affected/assigned variables, and cycle detection ported using upstream AST hooks |
| DONE | Port validations | JSON validation, use-before-assignment, and `computeColumn`/`$$answer` validation ported |
| DONE | Preserve LSP-facing parser/tokenizer API | Upstream exports retained; `Parser.parseValue`, full-options `Tokenizer`, and legacy token metadata compatibility added |
| DONE | Add focused compatibility tests | Computation, operators, filters, tags, dependency graph, validations, subpaths, and LSP helpers covered |
| DONE | Migrate legacy SpotDraft regression coverage | Type assertions, operators, arithmetic, constructors, updates, sums, tags, dependency graph, and all validation categories migrated or confirmed equivalent |
| DONE | Run full validation | Typecheck, lint, unit tests, build, package dry run, and CommonJS shim smoke tests pass |
| DONE | Produce final migration report | See `.ai/upstream-merge-report.md` |

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
3. Keep dependency and scope analysis parser-based. Scan `parseAssign` tag bodies for JSON validation because malformed legacy syntax cannot be represented by the upstream AST.
4. Preserve custom behavior even where upstream has similarly named filters or tags until compatibility tests prove equivalence.

## Remaining Risks

- Upstream's expression and template AST shapes differ substantially from the legacy parser templates.
- Legacy null/default arithmetic semantics are now covered by focused regression tests, but production data may contain combinations absent from the historical fixtures.
- The LSP consumer may depend on undocumented parser/token fields beyond the published declarations.
- `computeColumn` mutates table data and scope; upstream `Context` isolation semantics must be tested carefully.

## Verification Log

- 2026-06-15: `npm test` could not run because `node_modules` is absent and `mocha` is unavailable.
- 2026-06-15: `npm run lint` completed with 3,546 pre-existing errors in the legacy fork.
- 2026-06-15: Recorded `upstream/master` as merge ancestry and adopted its TypeScript source tree as the migration baseline.
- 2026-06-15: Typed computation/filter slice passes typecheck, focused lint, build, and all 1,557 upstream/fork tests currently present.
- 2026-06-15: Custom tags and `$$answer` identifier support pass build, lint, and all 1,562 tests.
- 2026-06-15: Dependency graph, validation APIs, and historical CommonJS subpaths pass build, lint, shim smoke tests, and all 1,568 tests.
- 2026-06-15: LSP compatibility helpers, package contents, and `Liquid#checkValidJSON` validated; migration is ready for review.
- 2026-06-15: Legacy SpotDraft regression coverage migrated in one-purpose commits; build, 99 Jest suites/1,790 tests, lint, package dry run, and CommonJS subpath smoke tests pass.
