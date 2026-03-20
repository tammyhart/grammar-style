import { expect, test, vi } from "vitest"
import createTailwindTheme from "./tailwind"

const mockConfig = vi.fn(() => ({
  primitives: {
    color: { stone: { 900: "#1A1A1A" }, brand: "#ff0000" },
    size: { "400": "1rem" },
    radius: { "round": "50%" },
    shadow: { "soft": "0 0.25rem 0.625rem rgba(0,0,0,0.1)" }
  },
  semantics: {
    color: { primary: "color.brand" },
    spacing: { base: "size.400" },
    radius: { standard: "radius.round" },
    shadow: { default: "shadow.soft" }
  },
  options: {
    breakpoints: {
      mobile: "20rem",
      weird_media: "color.brand" // Natively tests when regex fails resolving
    }
  }
}))

vi.mock("../config", () => ({
  get loadConfigSync() {
    return mockConfig
  }
}))

test("createTailwindTheme generates strict deeply-nested css variable maps iteratively", () => {
  const result = createTailwindTheme()
  const theme = result.theme?.extend
  
  // Confirms nested structures evaluate recursively tracking `p.color` recursively correctly
  expect((theme?.colors as any)?.stone["900"]).toBe("var(--color-stone-900)")
  expect((theme?.spacing as any)?.["400"]).toBe("var(--size-400)")
  expect((theme?.borderRadius as any)?.round).toBe("var(--radius-round)")
  expect((theme?.boxShadow as any)?.soft).toBe("var(--shadow-soft)")
})

test("tailwind gracefully resolves missing primitive and semantic dictionaries seamlessly", () => {
  mockConfig.mockReturnValueOnce({
    primitives: {}, semantics: {}
  } as any)
  
  const empty = createTailwindTheme()
  const ex = empty.theme?.extend
  expect(ex?.colors).toEqual({})
  expect(Object.keys(ex?.spacing as any).length).toBeGreaterThan(0) // Has defaults natively
  expect(ex?.boxShadow).toEqual({})
  expect(ex?.borderRadius).toEqual({})
})

test("createTailwindTheme accepts providedConfig explicitly", () => {
  const customConfig = {
    primitives: { color: { explicitlyPassed: "#123456" } },
    semantics: { color: { explicitlyMapped: "color.explicitlyPassed" } },
    options: {}
  } as any;
  
  const result = createTailwindTheme(customConfig)
  expect((result.theme?.extend?.colors as any)?.explicitlyPassed).toBe("var(--color-explicitlyPassed)")
})
