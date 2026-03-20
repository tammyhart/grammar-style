import { expect, test, vi } from "vitest"
import createLinariaTheme from "./linaria"

vi.mock("../config", () => ({
  loadConfigSync: () => ({
    primitives: { color: { brand: "#ff0000" } },
    semantics: { color: { primary: "color.brand" } }
  })
}));

test("createLinariaTheme generates expected structure", () => {
  const result = createLinariaTheme()
  expect(result.cssText).toBeDefined()
})

test("createLinariaTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: {}
  } as any;
  
  const result = createLinariaTheme(customConfig)
  expect(result.cssText).toContain("--color-explicitlyPassed: #123456;")
})
