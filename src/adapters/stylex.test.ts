import { expect, test } from "vitest"
import createStylexTheme from "./stylex"

test("createStylexTheme generates css variable mapping", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createStylexTheme(config as any)
  
  expect((result.stylex.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.stylex.primitives as any).color.brand).toBe("var(--color-brand)")
})
