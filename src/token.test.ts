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
    // @ts-expect-error - testing the string transformation runtime mapping logic
    expect(token("spacing.md")).toBe("var(--spacing-md)")
  })
})
