# Upstream Merge Report

## Recommendation

**Status: Ready for review.**

The branch is based on current `upstream/master` (`8a0c74a7f`, 2026-06-14) and preserves the identified SpotDraft computation, tag, validation, dependency-analysis, and LSP-facing behavior. It should be integration-tested against the consuming Liquid LSP before release because the package has moved from the LiquidJS 3.x runtime architecture to LiquidJS 10.27.0.

## Divergence Summary

- Original fork divergence: 83 commits ahead and 1,056 commits behind upstream.
- Original merge base: `e275368cb396aae75105c741b07ddb519c52eaa6`.
- Original fork delta: 50 files and roughly 14,700 insertions, including generated bundles.
- Migration strategy: record upstream ancestry, adopt the upstream TypeScript tree, then port fork behavior as isolated extensions with compatibility tests.

## Upstream Improvements Adopted

- TypeScript source and generated declarations.
- Current tokenizer, parser, AST, context, renderer, and plugin/tag/filter architecture.
- Built-in static analysis and variable-location APIs.
- Render, parse, template, and memory limits.
- Current own-property and prototype-safety behavior.
- Current Node, browser, ESM, CommonJS, and package build outputs.
- Upstream fixes through LiquidJS 10.27.0, including recent security hardening.

Shopify layout/render compatibility changes were accepted as part of the upstream baseline but were not used to drive migration decisions.

## Custom Features Preserved

### Computation

- Currency, duration, date, scalar, null, undefined, and object arithmetic.
- Date/duration addition and subtraction and date-difference durations.
- Decimal precision behavior, including three-decimal division compatibility.
- CommonForm-aware equality and ordering for currency, duration, date, phone, and arrays.
- `toCurrency`, `toDuration`, `sumArray`, `updateAttribute`, and `updateTypeAttribute` filters.

### Tags

- `parseAssign` JSON assignment.
- `assignVar` variable-reference assignment.
- `computeColumn` row computation with `self`, `$$answer`, and isolated temporary assignments.
- `$` identifier support required by `$$answer`.

### Static Analysis and Validation

- Assignment dependency extraction and dependency-tree construction.
- Affected-variable traversal, assigned-variable extraction, and cycle detection.
- Invalid `parseAssign` JSON reporting.
- Branch-aware use-before-assignment reporting.
- Top-level `$$answer` validation for `computeColumn`.
- Historical `liquidjs/dependency-graph` and `liquidjs/validations` CommonJS/type subpaths.
- `Liquid#checkValidJSON` instance compatibility.

### LSP Surface

- Upstream `Tokenizer`, `TokenKind`, token classes, `Parser`, `Value`, expression helpers, errors, and static analysis exports.
- `Parser.parseValue` compatibility helper.
- `Tokenizer` accepts either an operator map or full normalized Liquid options.
- Legacy token `raw`, `line`, and `type` metadata getters.

## Validation

- `npm ci`
- `npm run build`
- `npm test -- --runInBand`
- `npm run lint`
- `npx tsc --noEmit`
- `npm pack --dry-run --json`
- CommonJS subpath smoke test for `dependency-graph.js` and `validations.js`

## Remaining Risks

- The consuming LSP has not been compiled or exercised against this branch in this repository.
- LiquidJS 10 uses a named/class-based public API; callers relying on the old callable default factory must migrate to `new Liquid(options)`.
- Date arithmetic no longer depends on Moment.js and uses native `Date`; month-end and timezone edge cases should be tested with production fixtures.
- Dependency and validation compatibility covers the identified fork contracts, but production templates may contain undocumented legacy parser edge cases.
- Generated bundles are validated by the build but remain release artifacts rather than source-of-truth merge inputs.
