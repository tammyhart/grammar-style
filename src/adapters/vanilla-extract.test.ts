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

test("createVanillaExtractTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: { color: { explicitlyMapped: "color.explicitlyPassed" } }
  } as any;
  
  const result = createVanillaExtractTheme(customConfig)
  expect((result.vanillaExtract.primitives as any).color.explicitlyPassed).toBe("var(--color-explicitlyPassed)")
})
