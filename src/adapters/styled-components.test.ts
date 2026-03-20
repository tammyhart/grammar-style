import { expect, test, vi } from "vitest"
import createStyledComponentsTheme from "./styled-components"

vi.mock("styled-components", () => ({
  createGlobalStyle: vi.fn(() => "MockedGlobalStyle")
}))

test("createStyledComponentsTheme generates css mapping and GlobalThemeStyle", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      color: { primary: "color.brand" }
    }
  }
  
  const result = createStyledComponentsTheme(config as any)
  
  expect((result.styledComponents.semantics as any).color.primary).toBe("var(--color-primary)")
  expect(result.GlobalThemeStyle).toBeDefined()
  expect(result.cssText).toBeDefined()
})
