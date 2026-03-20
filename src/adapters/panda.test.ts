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
