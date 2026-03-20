import { expect, test, vi } from "vitest"
import createVanillaExtractTheme from "./vanilla-extract"

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

test("createVanillaExtractTheme generates css variable mapping", () => {
  
  const result = createVanillaExtractTheme()
  
  expect((result.vanillaExtract.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.vanillaExtract.primitives as any).color.brand).toBe("var(--color-brand)")
})
