import { describe, it, expect } from "vitest"
import token from "./token"

describe("token", () => {
  it("returns empty string if falsy path", () => {
    // @ts-expect-error - value resolves to never natively because it's not bound
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
    // @ts-expect-error - testing the string transformation runtime mapping logic
    expect(token("blur(size.16)")).toBe("blur(var(--size-16))")
  })
})
