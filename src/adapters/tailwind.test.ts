import { expect, test } from "vitest"
import createTailwindTheme from "./tailwind"

test("createTailwindTheme generates css variable mapping", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createTailwindTheme(config as any)
  
  // Checking that it maps out the deeply nested property to its corresponding linear var() name
  expect((result.tailwind.semantics as any).color.primary).toBe("var(--color-primary)")
  expect((result.tailwind.primitives as any).color.brand).toBe("var(--color-brand)")
})
