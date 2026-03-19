import { describe, it, expect } from "vitest"
import token from "./token"

describe("token", () => {
  it("returns empty string if falsy path", () => {
    // Empty strings are now supported as valid
    expect(token("")).toBe("")
    // @ts-expect-error
    expect(token(undefined)).toBe("")
    // @ts-expect-error
    expect(token(null)).toBe("")
  })

  it("converts dot notation to CSS variable format", () => {
    // @ts-expect-error - testing the string transformation runtime mapping logic
    expect(token("color.primary.base")).toBe("var(--color-primary-base)")
    // @ts-expect-error
    expect(token("spacing.md")).toBe("var(--spacing-md)")
  })

  it("handles negative paths", () => {
    // @ts-expect-error - testing string transformation runtime logic independently
    expect(token("-spacing.md")).toBe("var(--spacing-md-negative)")
    // Native token validation natively tests ValidSizeStr strings implicitly
    expect(token("-size.400")).toBe("var(--size-400-negative)")
  })

  it("handles paths with opacity", () => {
    // @ts-expect-error - testing the string transformation runtime mapping logic
    expect(token("color.primary.base/50")).toBe("var(--color-primary-base-50)")
  })

  it("throws an error for negative paths with opacity", () => {
    // @ts-expect-error - testing the string transformation runtime mapping logic
    expect(() => token("-color.primary.base/50")).toThrowError(
      "Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -color.primary.base/50"
    )
  })

  it("handles paths inside functions (like blur)", () => {
    // Composite tokens are now fully typed!
    expect(token("blur(size.16)")).toBe("blur(var(--size-16))")
  })

  it("handles multiple tokens in a generic shorthand string natively at runtime", () => {
    // @ts-expect-error - TS doesn't natively parse loose CSS properties
    expect(token("0 size.24 size.48 color.primary.base")).toBe(
      "0 var(--size-24) var(--size-48) var(--color-primary-base)"
    )
  })

  it("handles CSS math logic natively at runtime", () => {
    // @ts-expect-error - TS doesn't natively parse loose CSS calc strings
    expect(token("calc(size.100 * 2)")).toBe("calc(var(--size-100) * 2)")
    
    // @ts-expect-error
    expect(token("translate(-size.50, size.50)")).toBe(
      "translate(var(--size-50-negative), var(--size-50))"
    )
  })
})
