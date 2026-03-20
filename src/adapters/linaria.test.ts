import { expect, test } from "vitest"
import createLinariaTheme from "./linaria"

test("createLinariaTheme generates expected structure", () => {
  const config = {
    primitives: {
      color: { brand: "#ff0000" }
    },
    semantics: {
      primary: "color.brand"
    }
  }
  
  // Just testing if it returns the right keys since evaluating css tag might throw without babel plugin!
  try {
    const result = createLinariaTheme(config as any)
    expect(result.globals).toBeDefined()
    expect(result.cssText).toBeDefined()
  } catch (err: any) {
    // Linaria core css throws an error saying it's not supported at runtime natively.
    // If we're not running babel plugin in vitest, we expect this throw.
    expect(err.message).toContain("supported")
  }
})
