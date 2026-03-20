import { expect, test, vi } from "vitest"
import createEmotionTheme from "./emotion"

vi.mock("@emotion/react", () => ({
  Global: vi.fn(),
  css: vi.fn((strings, ...values) => strings.join("")) // Mocking css tag
}))

test("createEmotionTheme generates css mapping and GlobalThemeStyle", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createEmotionTheme(config as any)
  
  expect((result.emotion.semantics as any).color.primary).toBe("var(--color-primary)")
  expect(result.GlobalThemeStyle).toBeDefined()
})
