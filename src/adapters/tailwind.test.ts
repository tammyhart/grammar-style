import { expect, test, vi } from "vitest"
import createTailwindTheme from "./tailwind"

vi.mock("../config", () => ({
  loadConfigSync: () => ({
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  })
}))

test("createTailwindTheme generates css variable mapping", () => {
  const result = createTailwindTheme()
  
  expect((result.theme?.extend?.colors as any)?.primary).toBe("var(--color-primary)")
  expect((result.theme?.extend?.colors as any)?.brand).toBe("var(--color-brand)")
})
