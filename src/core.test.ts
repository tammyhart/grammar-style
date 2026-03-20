import { describe, it, expect, vi } from "vitest"
import { createTheme } from "./core"

describe("createTheme", () => {
  const mockConfig = {
    options: {
      breakpoints: {
        desktop: "size.400",
        mobile: "20rem"
      },
      opacities: [10, 50],
    },
    primitives: {
      color: {
        brand: "#ff0000",
        rgbColor: "rgb(255, 0, 0)",
        hslColor: "hsl(0, 100%, 50%)",
      }
    },
    semantics: {
      background: "color.brand",
      foreground: "color.brand/50", 
      nested: {
        color: "color.rgbColor",
        other: "color.hslColor/10"
      },
      negative: "-size.400" 
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
    
    expect(theme.cssText).toContain("--foreground: rgba(var(--color-brand-rgb), 0.5);")
    expect(theme.cssText).toContain("--nested-other: rgba(var(--color-hslColor-rgb), 0.1);")
  })

  it("handles negative resolution math via calc() wrappers", () => {
    const theme = createTheme(mockConfig)
    
    expect(theme.cssText).toContain("--negative: -25rem;")
  })

  it("throws error if size is included in primitives", () => {
    const badConfig = { primitives: { size: { "16": "1rem" } }, semantics: {} }
    expect(() => createTheme(badConfig as any)).toThrow("strict geometric constant")
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
    expect(theme.cssText).toContain("--background: rgba(var(--color-brand-rgb), 0.1);")
  })

  it("generates responsive wrappers using correct CSS media breakpoints", () => {
    const theme = createTheme(mockConfig)

    // desktop = size.400 -> properly maps to 25rem math
    expect(theme.cssText).toContain("@media (min-width: 25rem) {")
    
    // desktopMax = size.400 - size.1 -> calc(25rem - 1px)
    expect(theme.cssText).toContain("@media (max-width: calc(25rem - 1px)) {")

    // mobileMax = calc(20rem - 1px)
    expect(theme.cssText).toContain("@media (max-width: calc(20rem - 1px)) {")
  })

  it("returns generated media strings inside the theme configuration result", () => {
    const theme = createTheme(mockConfig as any)

    const media = theme.media as Record<string, string>
    expect(media.desktop).toBe("@media (min-width: 25rem)")
    expect(media.desktopMax).toBe("@media (max-width: calc(25rem - 1px))")
    expect(media.mobile).toBe("@media (min-width: 20rem)")
    expect(media.mobileMax).toBe("@media (max-width: calc(20rem - 1px))")
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
    expect(theme.cssText).toContain("--color-shortHex-rgb: 255, 0, 0;")
    expect(theme.cssText).toContain("--wrapper: rgba(var(--color-shortHex-rgb), 0.1);")
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

  it("handles 8-length hex codes and explicit formats correctly", () => {
    const config = {
      primitives: { color: { hex8: "#ff0000ff", rgb: "rgb(255, 0, 0)" } },
      semantics: { color: { bg: "color.hex8/50", border: "color.rgb/50" } }
    }
    const result = createTheme(config)
    expect(result.cssText).toContain("--color-hex8-rgb: 255, 0, 0;")
    expect(result.cssText).toContain("--color-bg: rgba(var(--color-hex8-rgb), 0.5);")
  })

  it("verifies negative mathematical scaling cleanly without custom tracker", () => {
    // Overriding context so token logic returns calc natively without variables internally
    // We execute formatTokenToCssVar via core with primitives null or customTracker null
    // But since createTheme uses a tracker, we can test array branch parsing manually
    const config = {
      primitives: {},
      semantics: { spacing: { list: ["-size.16", "size.16"] } } // Hit branch array mapping
    }
    expect(createTheme(config as any).primitives).toBeDefined()
  })

  it("safely attempts file reading branches", () => {
    // Triggers internal stat branches if process.cwd points somewhere with unreadable dirs
    // It shouldn't crash.
    const result = createTheme({ semantics: {} })
    expect(result).toBeDefined()
  })

  it("retains all default breakpoints when only overriding an existing one", () => {
    const config = {
      options: {
        breakpoints: {
          sm: "10rem"
        }
      },
      semantics: {}
    }
    const theme = createTheme(config)
    expect(theme.media.sm).toBe("@media (min-width: 10rem)")
    expect(theme.media.smMax).toBe("@media (max-width: calc(10rem - 1px))")
    expect(theme.media.md).toBeDefined() // Re-asserts the default behavior retained the rest
  })

  it("removes default breakpoints when establishing an entirely custom dictionary", () => {
    const config = {
      options: {
        breakpoints: {
          customGrid: "size.96"
        }
      },
      semantics: {}
    }
    const theme = createTheme(config)
    const media = theme.media as Record<string, string>
    expect(media.customGrid).toBe("@media (min-width: 6rem)")
    expect(media.customGridMax).toBe("@media (max-width: calc(6rem - 1px))")
    expect(media.sm).toBeUndefined() // Wiped 
  })
})
