import { expect, test, vi, beforeEach } from "vitest"

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
})

test("media proxy safely evaluates triggers seamlessly from unhydrated empty cache", async () => {
  vi.doMock("./config", () => ({
    loadConfigSync: vi.fn(() => ({
      options: { breakpoints: { mobile: "20rem" } },
      primitives: { size: { "600": "37.5rem" } },
      semantics: {}
    }))
  }))

  const { default: freshMedia } = await import("./media")
  expect("mobile" in freshMedia).toBe(true) // Hits line 45 (cold has trap trigger)

  vi.resetModules()
  const { breakpoint: freshBreakpoint } = await import("./media")
  expect("mobile" in freshBreakpoint).toBe(true) // Hits line 96 (cold has trap trigger)

  vi.resetModules()
  const { default: fmKeys } = await import("./media")
  expect(Object.keys(fmKeys)).toContain("mobile") // Hits line 37 (cold ownKeys trigger)

  vi.resetModules()
  const { breakpoint: fbKeys } = await import("./media")
  expect(Object.keys(fbKeys)).toContain("mobile") // Hits line 88 (cold ownKeys trigger)
})

test("proxy throws elegantly on missing config file", async () => {
  vi.doMock("./config", () => ({
    loadConfigSync: () => null
  }))

  const { default: nullMedia } = await import("./media")
  expect(() => nullMedia.mobile).toThrow("Could not find grammar.config.ts") // Hits line 26
})

test("browser environment strictly mitigates config file reading entirely", async () => {
  // Simulating a browser runtime perfectly
  vi.stubGlobal("window", { document: {} })

  vi.doMock("./config", () => ({
    loadConfigSync: () => null // Irrelevant because it shouldn't be read!
  }))

  const { default: browserMedia, breakpoint: browserBreakpoint } = await import("./media")

  // Properties safely return fallbacks natively
  expect(Object.keys(browserMedia)).toEqual([]) // Hits line 35
  expect(Object.keys(browserBreakpoint)).toEqual([]) // Hits line 86

  expect("mobile" in browserMedia).toBe(false) // Hits line 44
  expect("mobile" in browserBreakpoint).toBe(false) // Hits line 95

  // Fetching properties strictly throws runtime browser errors structurally
  expect(() => browserMedia.mobile).toThrow("browser runtime components") // Hits line 20
  
  // breakpoint object also inherently verifies the browser
  expect(() => browserBreakpoint.mobile).toThrow("browser runtime components") // Hits line 69-75 (through trigger)
})
