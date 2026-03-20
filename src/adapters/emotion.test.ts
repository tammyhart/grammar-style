import { expect, test, vi } from "vitest"
import createEmotionTheme from "./emotion"

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

vi.mock("@emotion/react", () => ({
  Global: vi.fn(),
  css: vi.fn((strings, ...values) => strings.join("")) // Mocking css tag
}))

test("createEmotionTheme generates css mapping and GlobalThemeStyle", () => {
  
  const result = createEmotionTheme()
  
  expect((result.emotion.semantics as any).color.primary).toBe("var(--color-primary)")
  expect(result.GlobalThemeStyle).toBeDefined()
  expect(result.GlobalThemeStyle()).toBeDefined() // Covers the internal branch evaluation
})

test("createEmotionTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: { color: { mapped: "color.explicitlyPassed" } }
  } as any;
  
  const result = createEmotionTheme(customConfig)
  expect((result.emotion.semantics as any).color.mapped).toBe("var(--color-mapped)")
})
