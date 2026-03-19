import { describe, it, expect, vi } from "vitest"
import { createTheme } from "./core"

describe("createTheme", () => {
  const mockConfig = {
    options: {
      breakpoints: {
        desktop: "size.1000",
        mobile: "20rem"
      },
      opacities: [10, 50],
    },
    primitives: {
      color: {
        brand: "#ff0000",
        rgbColor: "rgb(255, 0, 0)",
        hslColor: "hsl(0, 100%, 50%)",
      },
      size: { 
        "1000": "62.5rem",
        "1": "0.0625rem"
      }
    },
    semantics: {
      background: "color.brand",
      foreground: "color.brand/50", 
      nested: {
        color: "color.rgbColor",
        other: "color.hslColor/10"
      },
      negative: "-size.1000" 
    },
    modes: {
      dark: {
        background: "color.brand/10"
      }
    },
    responsive: {
      desktop: {
        nested: {
          color: "color.brand"
        }
      },
      desktopMax: {
        nested: {
          color: "color.brand"
        }
      },
      mobileMax: { // Using rem native subtraction
        nested: {
          color: "color.brand"
        }
      }
    }
  }

  it("generates baseline css variables", () => {
    const theme = createTheme(mockConfig)
    
    expect(theme.tokens.background).toBe("color.brand")
    expect(theme.cssText).toContain("--color-brand: #ff0000;")
    expect(theme.cssText).toContain("--background: var(--color-brand);")
  })

  it("generates correct opacity wrappers using math equivalents", () => {
    const theme = createTheme(mockConfig)
    
    expect(theme.cssText).toContain("--color-brand-50: rgba(255, 0, 0, 0.5);")
    expect(theme.cssText).toContain("--foreground: var(--color-brand-50);")
    expect(theme.cssText).toContain("--color-hslColor-10: hsla(0, 100%, 50%, 0.1);")
  })

  it("handles negative resolution math via calc() wrappers", () => {
    const theme = createTheme(mockConfig)
    
    expect(theme.cssText).toContain("--negative: var(--size-1000-negative)")
    expect(theme.cssText).toContain("--size-1000-negative: calc(var(--size-1000) * -1)")
  })

  it("throws error when trying to use px values", () => {
    const badConfig = {
      semantics: {
        spacing: "10px"
      }
    }
    expect(() => createTheme(badConfig)).toThrow("'px' values are not allowed")
  })

  it("generates nested mode overrides wrapped in [data-theme] selector", () => {
    const theme = createTheme(mockConfig)
    expect(theme.cssText).toContain("[data-theme=\"dark\"] {")
    expect(theme.cssText).toContain("--background: var(--color-brand-10);")
  })

  it("generates responsive wrappers using correct CSS media breakpoints", () => {
    const theme = createTheme(mockConfig)

    // desktop = size.1000 -> properly maps to 62.5rem math
    expect(theme.cssText).toContain("@media (min-width: 62.5rem) {")
    
    // desktopMax = size.1000 - size.1 -> 62.5 - 0.0625 = 62.4375rem
    expect(theme.cssText).toContain("@media (max-width: 62.4375rem) {")

    // mobileMax = 20rem - 0.0625rem = 19.9375rem
    expect(theme.cssText).toContain("@media (max-width: 19.9375rem) {")
  })



  it("handles 3-digit hex and nested fallback opacities", () => {
    const arrConfig = {
      primitives: {
        color: {
          shortHex: "#f00"
        }
      },
      semantics: {
        wrapper: "color.shortHex/10"
      }
    }
    const theme = createTheme(arrConfig)
    expect(theme.cssText).toContain("--color-shortHex-10: rgba(255, 0, 0, 0.1);")
    expect(theme.cssText).toContain("--wrapper: var(--color-shortHex-10);")
  })

  it("throws error for improper opacity resolutions", () => {
    const arrConfig = {
      primitives: {
        color: {
          bad: "unknownFunc(0,0,0)"
        }
      },
      semantics: {
        wrapper: "color.bad/10"
      }
    }
    expect(() => createTheme(arrConfig)).toThrow("Unable to parse primitive 'color.bad' for opacity transform")
  })

  it("throws error for opacity values out of bounds", () => {
    const arrConfig = { options: { opacities: [105] }, semantics: {} }
    expect(() => createTheme(arrConfig)).toThrow("Opacity values must be between 0 and 100")
  })

  it("warns when responsive breakpoint isn't defined", () => {
    const warnSpy = vi.spyOn(console, 'warn')
    const badBpConfig = {
      semantics: {},
      responsive: {
        unknownBp: {
          background: "color.brand"
        }
      }
    }
    createTheme(badBpConfig)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("was used in responsive options, but not defined"))
    vi.restoreAllMocks()
  })
})
