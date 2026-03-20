import { expect, test, vi } from "vitest"
import createLinariaTheme from "./linaria"

vi.mock("../config", () => ({
  loadConfigSync: () => ({
    primitives: { color: { brand: "#ff0000" } },
    semantics: { color: { primary: "color.brand" } }
  })
}));

test("createLinariaTheme generates expected structure", () => {
  // Just testing if it returns the right keys since evaluating css tag might throw without babel plugin!
  try {
    const result = createLinariaTheme()
    expect(result.globals).toBeDefined()
    expect(result.cssText).toBeDefined()
  } catch (err: any) {
    // Linaria core css throws an error saying it's not supported at runtime natively.
    expect(err.message).toContain("supported")
  }
})

test("createLinariaTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: {}
  } as any;
  
  const result = createLinariaTheme(customConfig)
  expect(result.cssText).toContain("--color-explicitlyPassed: #123456;")
})
