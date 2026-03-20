# grammar-style

## 0.3.11

### Patch Changes

- Fixed an `ERR_MODULE_NOT_FOUND` boot regression in native Node.js ESM environments when attempting to trace the `grammar-style` index dynamically without the explicit external `./generated` override file extension.

## 0.3.10

### Patch Changes

- Added a new `"grammar-style/generated"` export that bypasses the internal module dependency graph completely. If you execute `grammar-style generate` during your build step, `import { media } from "grammar-style/generated"` will statically resolve the plain AST objects natively without crashing CSS-in-JS sandbox extractors (Linaria, Vanilla Extract).

## 0.3.9

### Patch Changes

- Fixed an issue where the global `media` and `breakpoint` objects remained wrapped in a `Proxy` even when pre-generated via the CLI. These are now exported as clean POJOs natively when `hasGenerated` is true, enabling zero-config integration with strict AST extractors like Linaria and Vanilla-Extract.

## 0.3.8

### Patch Changes

- Fixed a compilation build error in the Tailwind adapter when generating Typescript definitions caused by strict breakpoint typing without an index cast (`TS7053`).

## 0.3.7

### Patch Changes

- Fixed an issue where `media` objects would loosely fallback to `string` in TypeScript without a customized configuration, incorrectly allowing any invalid media key lookup (like `media.lap`). Modifying partial defaults now safely infers retained default breakpoints.

## 0.3.6

### Patch Changes

- feat: Rearchitect adapter exports to allow clean `grammar-style/[adapter]` imports, avoiding Next.js/Linaria module evaluation crashes entirely.
- fix: Remove `@linaria/core` and literal `css` wrapper from the linaria adapter core to prevent AST evaluation errors from WYW plugins.

## 0.3.5

### Patch Changes

- feat: Introduce CLI for generating global context and enable explicit config passing in adapters.

## 0.3.4

### Patch Changes

- feat: Introduce CLI for generating global context and enable explicit config passing in adapters.

## 0.3.2

### Patch Changes

- Relax the strict token type-checks for semantic values. By permitting valid, non-dot CSS strings (like \`"ease"\`, \`"solid"\`, or numbers), users can cleanly write composite properties like \`transition: "0.2s ease"\` or \`border: "size.1 solid color.syntax.500"\` without triggering invalid token errors, while still enforcing token restrictions on raw color literals.

## 0.3.1

### Patch Changes

- Update ownership

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

  - Refactored all 7 framework adapters to automatically load and synchronously parse the `grammar.config.ts` file locally natively via `jiti`, completely eliminating `theme` injection boilerplate!
  - Consolidated disparate subdirectories into a generic `grammar-style/adapters` index.
  - Injected native `.extend` tracking variables securely across Panda CSS, StyleX, Vanilla Extract, Tailwind, Linaria, Emotion, and Styled Components mapping identically out of the box.

  ### Build pipeline and Distribution Health

  - Fully configured `tsup` bundlers enabling pure `cjs` and `esm` splits simultaneously natively.
  - Forced `"sideEffects": false` so modern tree-shakers proactively ignore bundled adapters natively.
  - Restructured `package.json` identically aligned to NodeJS FOSS standards (MIT licensing authenticated, Identity mapping enforced, and Node `engines` locked internally >=18.0.0).
  - Elevated `jiti` to a mandatory root dependency enabling `grammar.config.ts` to perfectly load everywhere.

## 0.2.1

### Patch Changes

- Fixed custom opacity compilation, typescript composition resolution errors, hex color mappings, parsing regex misses, and resolved init configuration logic.

## 0.2.0

### Minor Changes

- Initial stable core release containing all 7 CSS framework adapters
