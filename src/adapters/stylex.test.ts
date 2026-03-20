import { expect, test, vi } from "vitest"
import createStylexTheme from "./stylex"

vi.mock("../config", () => ({
  loadConfigSync: () => ({
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  })
}));

test("createStylexTheme generates css variable mapping", () => {
  
  const result = createStylexTheme()
  
  expect((result.stylex.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.stylex.primitives as any).color.brand).toBe("var(--color-brand)")
})
