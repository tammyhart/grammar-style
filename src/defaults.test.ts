import { describe, it, expect } from "vitest"
import { defaultSizes, defaultBreakpoints, defaultOpacities, baseBreakpoints, generateBreakpoints, generateSizes } from "./defaults"

describe("Defaults generator", () => {
  it("generates correct sizes mapped to rem values natively", () => {
    const customSizes = generateSizes()
    expect(customSizes[1]).toBe("0.0625rem") // 1 / 16
    expect(customSizes[16]).toBe("1rem")
    expect(customSizes[20]).toBe("1.25rem") // 20 / 16
    expect(customSizes[300]).toBe("18.75rem") // 300 / 16
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

  it("properly converts rem unit breakpoints to Max values", () => {
    const customBps = { custom: "40rem" }
    const generated = generateBreakpoints(customBps) as any
    expect(generated.customMax).toBe("39.9375rem")
  })

  it("ignores non-matching breakpoint values for generating maxes", () => {
    const customBps = { custom: "custom-token" }
    const generated = generateBreakpoints(customBps) as any
    expect(generated.custom).toBe("custom-token")
    expect(generated.customMax).toBeUndefined()
  })

  it("uses baseBreakpoints as the default argument when called with no arguments", () => {
    const generated = generateBreakpoints()
    expect(generated.palm).toBe(baseBreakpoints.palm)
    expect(generated.palmMax).toBe(`${baseBreakpoints.palm} - size.1`)
  })
})
