import { expect, test } from "vitest"
import createVanillaExtractTheme from "./vanilla-extract"

test("createVanillaExtractTheme generates css variable mapping", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createVanillaExtractTheme(config as any)
  
  expect((result.vanillaExtract.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.vanillaExtract.primitives as any).color.brand).toBe("var(--color-brand)")
})
