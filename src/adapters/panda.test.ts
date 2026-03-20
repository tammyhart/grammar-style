import { expect, test, vi } from "vitest"
import createPandaTheme from "./panda"

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

test("createPandaTheme generates css variable mapping", () => {
  
  const result = createPandaTheme()
  
  expect((result.panda.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.panda.primitives as any).color.brand).toBe("var(--color-brand)")
})

test("createPandaTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: { color: { explicitlyMapped: "color.explicitlyPassed" } }
  } as any;
  
  const result = createPandaTheme(customConfig)
  expect((result.panda.primitives as any).color.explicitlyPassed).toBe("var(--color-explicitlyPassed)")
})
