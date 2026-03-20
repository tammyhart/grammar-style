# grammar-style

## 0.3.0

### Minor Changes

- Massive architecture and feature-completeness rollout

  ### Core Engine & Typings

  - Refined token regex parsing to natively evaluate and inject standard CSS formulas (e.g. `calc()`, `translate()`) seamlessly inside `token()` strings with 100% type safety.
  - Exiled generic `color-mix` mappings in favor of directly parsed, cross-browser `rgba()` fraction bindings.
  - Built a native `--negative-` CSS variable structure during AST scanning specifically for negated `size.*` primitives to bypass slow runtime negative computation overhead.
  - Implemented extremely strict recursive compiler validations explicitly banning `any`, generic interfaces, and loose parameter typing constraints natively.
  - Established strict input type validation asserting `[opacity]` values can only physically calculate numbers recursively between 0 and 100.

  ### Media & Responsive Tooling

  - Released standard `media` and `breakpoint` exports that lazily construct native responsive CSS constraints dynamically derived strictly from local configuration trees.

  ### Framework Adapters

  - Refactored all 7 framework adapters to automatically load and synchronously parse the [grammar.config.ts](cci:7://file:///Users/tammyhart/Documents/projects/grammar-style/test/grammar.config.ts:0:0-0:0) file locally natively via `jiti`, completely eliminating `theme` injection boilerplate!
  - Consolidated disparate subdirectories into a generic `grammar-style/adapters` index.
  - Injected native `.extend` tracking variables securely across Panda CSS, StyleX, Vanilla Extract, Tailwind, Linaria, Emotion, and Styled Components mapping identically out of the box.

  ### Build pipeline and Distribution Health

  - Fully configured `tsup` bundlers enabling pure `cjs` and `esm` splits simultaneously natively.
  - Forced `"sideEffects": false` so modern tree-shakers proactively ignore bundled adapters natively.
  - Restructured [package.json](cci:7://file:///Users/tammyhart/Documents/projects/grammar-style/package.json:0:0-0:0) identically aligned to NodeJS FOSS standards (MIT licensing authenticated, Identity mapping enforced, and Node `engines` locked internally >=18.0.0).
  - Elevated `jiti` to a mandatory root dependency enabling [grammar.config.ts](cci:7://file:///Users/tammyhart/Documents/projects/grammar-style/test/grammar.config.ts:0:0-0:0) to perfectly load everywhere.

## 0.2.1

### Patch Changes

- Fixed custom opacity compilation, typescript composition resolution errors, hex color mappings, parsing regex misses, and resolved init configuration logic.

## 0.2.0

### Minor Changes

- Initial stable core release containing all 7 CSS framework adapters
