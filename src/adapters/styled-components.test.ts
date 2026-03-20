import { expect, test, vi } from "vitest"
import createStyledComponentsTheme from "./styled-components"

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

vi.mock("styled-components", () => ({
  createGlobalStyle: vi.fn(() => "MockedGlobalStyle")
}))

test("createStyledComponentsTheme generates css mapping and GlobalThemeStyle", () => {
  
  const result = createStyledComponentsTheme()
  
  expect((result.styledComponents.semantics as any).color.primary).toBe("var(--color-primary)")
  expect(result.GlobalThemeStyle).toBeDefined()
  expect(result.cssText).toBeDefined()
})

test("createStyledComponentsTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: { color: { mapped: "color.explicitlyPassed" } }
  } as any;
  
  const result = createStyledComponentsTheme(customConfig)
  expect((result.styledComponents.semantics as any).color.mapped).toBe("var(--color-mapped)")
})
