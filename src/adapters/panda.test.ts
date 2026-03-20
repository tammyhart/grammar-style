import { expect, test } from "vitest"
import createPandaTheme from "./panda"

test("createPandaTheme generates css variable mapping", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createPandaTheme(config as any)
  
  expect((result.panda.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.panda.primitives as any).color.brand).toBe("var(--color-brand)")
})
