# Expose LSP Core Progress

| Status | Task | Notes |
|---|---|---|
| DONE | Inspect current exports | Checked `src/index.ts` and token sub-exports |
| DONE | Implement lsp-core helper APIs | Exposed static analysis and validations directly |
| DONE | Add tokenizer traversal and getTokenAtPosition | Implemented on-the-fly recursive sub-token parser in `src/parser/tokenizer.ts` |
| DONE | Add variable and assignment extractors | Verified variables via `analyzeSync()` and assignments via `createDependencyTree()` |
| DONE | Add validations / validations.js export | Root level `validations.js` shim is fully set up and exported |
| DONE | Expose via src/index.ts and package.json | Added concrete exports for all 13 token classes and `getTokenAtPosition` helper |
| DONE | Create and pass lsp-core smoke tests | `test/integration/liquid/lsp-core.spec.ts` passes successfully |
| DONE | Produce final summary report | Expose LSP-core task complete and ready for consumption |
