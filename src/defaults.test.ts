import { describe, it, expect } from "vitest"
import { defaultSizes, defaultBreakpoints, defaultOpacities, baseBreakpoints } from "./defaults"

describe("Defaults generator", () => {
  it("generates correct sizes mapped to rem values", () => {
    expect(defaultSizes[1]).toBe("0.0625rem") // 1 / 16
    expect(defaultSizes[16]).toBe("1rem")
    expect(defaultSizes[20]).toBe("1.25rem") // 20 / 16
    expect(defaultSizes[300]).toBe("18.75rem") // 300 / 16
  })

  it("generates max breakpoints automatically by subtracting size.1", () => {
    const palm = baseBreakpoints.palm
    expect(defaultBreakpoints.palmMax).toBe(`${palm} - size.1`)
  })

  it("exports valid opacities structure matching logical scales", () => {
    expect(defaultOpacities[10]).toBe(0.1)
    expect(defaultOpacities[60]).toBe(0.6)
    expect(defaultOpacities[100]).toBe(1)
  })
})
