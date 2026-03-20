# ⚙️ Grammar Style Adapters

`grammar-style` is framework-agnostic. To bridge the gap between your strictly-typed dictionary and your favorite styling tool, we provide instant adapter functions that automatically parse your `grammar.config.ts` into the exact shape expected by the compiler!

## 1. Tailwind CSS

Drop `grammar-style` natively into your `tailwind.config.ts` to seamlessly map all semantic variables and base primitives into standard Tailwind utility classes (e.g., `text-primary`, `mt-brand`, `rounded-soft`, `max-md`).

```typescript
// tailwind.config.ts
import { createTailwindTheme } from "grammar-style/adapters/tailwind"

// Automatically reads and parses grammar.config.ts locally
const grammar = createTailwindTheme()

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: grammar.theme,
}
```

## 2. Styled Components

Inject the underlying raw CSS stylesheet securely into your application tree, and effortlessly attach your entire nested token structure directly onto your standard `props.theme` component objects!

```tsx
// src/App.tsx
import { ThemeProvider } from "styled-components"
import { createStyledComponentsTheme } from "grammar-style/adapters/styled-components"

const grammar = createStyledComponentsTheme()

export const App = ({ children }) => {
  return (
    <ThemeProvider theme={grammar.styledComponents}>
      {/* Injects your natively calculated raw CSS variables into the root! */}
      <grammar.GlobalThemeStyle />
      {children}
    </ThemeProvider>
  )
}
```

## 3. Emotion

Similar to Styled Components, the Emotion adapter safely constructs a `<Global />` mountable wrapper along with a deeply mapped object for your standard `ThemeProvider`.

```tsx
// src/App.tsx
import { ThemeProvider } from "@emotion/react"
import { createEmotionTheme } from "grammar-style/adapters/emotion"

const grammar = createEmotionTheme()

export const App = ({ children }) => {
  return (
    <ThemeProvider theme={grammar.emotion}>
      <grammar.GlobalThemeStyle />
      {children}
    </ThemeProvider>
  )
}
```

## 4. Vanilla Extract

Extract your entire dictionary shape natively as a raw static JS map! You can seamlessly enforce standard styling behaviors referencing these strongly typed keys inside your static build files.

```typescript
// src/styles/theme.css.ts
import { createVanillaExtractTheme } from "grammar-style/adapters/vanilla-extract"

const grammar = createVanillaExtractTheme()

// Export the pre-mapped semantic theme variable structures directly
export const themeVariables = grammar.vanillaExtract
```

## 5. StyleX

Map your semantics effortlessly into StyleX using the exported primitives block.

```typescript
// src/styles/theme.stylex.ts
import * as stylex from "@stylexjs/stylex"
import { createStylexTheme } from "grammar-style/adapters/stylex"

const grammar = createStylexTheme()

export const colors = stylex.defineVars(grammar.stylex.semantics.color)
export const spacing = stylex.defineVars(grammar.stylex.semantics.spacing)
```

## 6. Panda CSS

Consume natively transformed objects safely into Panda's strict static definitions mapping.

```typescript
// panda.config.ts
import { defineConfig } from "@pandacss/dev"
import { createPandaTheme } from "grammar-style/adapters/panda"

const grammar = createPandaTheme()

export default defineConfig({
  // ...
  theme: {
    extend: {
      tokens: grammar.panda.primitives,
      semanticTokens: grammar.panda.semantics,
    },
  },
})
```

## 7. Linaria

Since Linaria perfectly parses pure standard CSS inside template tags at build-time, you only need to mount the raw generated AST into a global scope block to enable all nested styling dependencies!

```typescript
// src/styles/global.ts
import { css } from "@linaria/core"
import { createLinariaTheme } from "grammar-style/adapters/linaria"

const grammar = createLinariaTheme()

// Directly injects the entire mapped `var(...)` tree!
export const globals = css`
  :global() {
    ${grammar.cssText}
  }
`
```
