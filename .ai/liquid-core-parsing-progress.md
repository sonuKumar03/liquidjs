# Liquid Core Parsing Progress

| Status | Task | Notes |
|---|---|---|
| DONE | **Phase 1: Standardized Tokenization & Normalization** | |
| DONE | - Implement decrement splitting (`a--` -> `a`, `-`, `-`) | Completed in tokenizer |
| DONE | - Implement unary/binary operator separation (`a | +2` or `a -2` -> split sign) | Completed in tokenizer |
| DONE | **Phase 2: Resilient Parsing & Error Recovery** | |
| DONE | - Implement tag isolation parsing wrapper | Completed with `parseResilient()` |
| DONE | - Implement diagnostic collection for parser exceptions | Completed with `parseResilient()` errors |
| DONE | - Implement resilient AST tree with placeholder nodes | Completed with `PlaceholderTemplate` |
| DONE | **Phase 3: Token-Based Property Path Validation** | |
| DONE | - Replace `expr.split('.')` with tokenizer-driven path scanner | Completed with `isValidPropertyPath()` |
| DONE | - Differentiate simple property chains from complex logical expressions | Completed with `isValidPropertyPath()` |
| DONE | **Phase 4: AST Character Offsets & Ranges** | |
| DONE | - Extend custom tags to preserve `begin`/`end` offsets | Completed with `TemplateImpl` getters |
| DONE | - Compute exact 0-indexed line/character ranges for diagnostics | Exposed offsets and 1-indexed token line |
| DONE | **Verification** | |
| DONE | - Create tests for lexical normalization, resilient parsing, property path validation, and range offsets | Tests added in `validations.spec.ts` |
| DONE | - Run full test suites and verify build compilation | All builds compile and 1,802 tests pass |
