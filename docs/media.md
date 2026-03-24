# 📐 Media Queries & Breakpoints

In addition to `token()`, `grammar-style` natively exposes two lazy-loaded Proxy objects directly from the root package: `media` and `breakpoint`.

They automatically evaluate your `grammar.config` responsive boundaries into reusable strings, formatting them precisely for either standard CSS template literals or Javascript object trees without importing your configuration directly.

## `import { media }`

The `media` object natively wraps your layout boundaries in standard `@media` structural headers. This is the perfect plug-and-play solution for CSS-in-JS frameworks that parse standard CSS format rules inside template literals (like Linaria, Styled Components, and modern Emotion).

```typescript
import { styled } from "styled-components"
import { media, token } from "grammar-style"

// 'media.lg' conditionally evaluates to: `@media (min-width: 62.5rem)`
export const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  ${media.lg} {
    grid-template-columns: repeat(2, 1fr);
    padding: ${token("size.16")};
  }

  /* Automatically generated Max structural endpoints! */
  ${media.lgMax} {
    display: none;
  }
`
```

## `import { breakpoint }`

If you are using a framework that parses styling logic through deeply nested Javascript Objects instead of native string CSS blocks (like Vanilla Extract, StyleX, or Object-Emotion), invoking the literal `@media` declaration breaks their internal key property rules explicitly because they expect the bare constraint query natively.

The `breakpoint` proxy maps identically to `media` but structurally scrubs the header, emitting exclusively the condition block string (e.g. `(min-width: 62.5rem)`).

```typescript
import { style } from "@vanilla-extract/css"
import { breakpoint, token } from "grammar-style"

// 'breakpoint.lg' natively emits strictly: `(min-width: 62.5rem)`
export const boxStyle = style({
  flexDirection: "column",
  "@media": {
    [breakpoint.lg]: {
      flexDirection: "row",
      padding: token("size.32"),
    },
  },
})
```

## Architecture Notes

### Component Boilerplate

Since `media` and `breakpoint` are Proxy singletons wired dynamically back to your `grammar.config.ts`, you never explicitly map `defineGrammar` context hooks locally in your individual `.tsx` files! They behave statically anywhere in your codebase flawlessly while strongly typing perfectly!

### Client-Side Execution

By default, because `media` and `breakpoint` dynamically traverse your filesystem architecture asynchronously via Node bindings to construct logic safely, they **cannot be executed directly inside client-side browsers**.

If you are running dynamically generated runtime CSS-in-JS engines in the client (e.g., standard React + runtime Styled Components) without a Node validation pipeline, these utilities will intentionally throw an error structurally.

**Wait, what if I need them in the Browser?**
No problem! If your architecture needs to read media queries inside a browser context, run `npx grammar-style generate`. This natively evaluates and caches the proxies into a pure static lookup map during your build step (`generated.ts`), seamlessly unlocking standard usage everywhere without any Node.js dependencies!

Here is an example of creating a local theme file to re-export the generated utilities alongside the main package utilities:

```typescript
// theme.ts
export { token } from "grammar-style"
export { media, breakpoint } from "grammar-style/generated"
```

Then you can import them cleanly in your components:

```typescript
import { media, token } from "@/theme"

// instead of:
// import { media, token } from "grammar-style"
```
