import { describe, it, expect } from "vitest"
import { formatTokenToCssVar, TOKEN_REGEX } from "./utils"

describe("formatTokenToCssVar", () => {
  it("formats standard tokens correctly", () => {
    expect(formatTokenToCssVar("", "color.primary.base")).toBe(
      "var(--color-primary-base)",
    )
    expect(formatTokenToCssVar("", "size.400")).toBe("25rem")
  })

  it("formats tokens with opacity correctly", () => {
    expect(formatTokenToCssVar("", "color.primary.base", "50")).toBe(
      "rgba(var(--color-primary-base-rgb), 0.5)",
    )
  })

  it("formats negative tokens correctly", () => {
    expect(formatTokenToCssVar("-", "size.400")).toBe(
      "-25rem",
    )
    expect(formatTokenToCssVar("-", "spacing.md")).toBe(
      "calc(var(--spacing-md) * -1)",
    )
  })

  it("throws an error when both negative and opacity are provided", () => {
    expect(() =>
      formatTokenToCssVar("-", "color.primary.base", "50"),
    ).toThrowError(
      "Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -color.primary.base/50",
    )
  })
})

describe("TOKEN_REGEX", () => {
  const getMatch = (str: string) => {
    // Reset lastIndex because of /g flag state
    TOKEN_REGEX.lastIndex = 0
    const match = TOKEN_REGEX.exec(str)
    return match ?
        {
          isNegative: match[1],
          tokenTarget: match[2],
          hasOpacity: match[3],
          opacityValue: match[4],
        }
      : null
  }

  it("matches standard paths", () => {
    expect(getMatch("size.400")).toEqual({
      isNegative: "",
      tokenTarget: "size.400",
      hasOpacity: undefined,
      opacityValue: undefined,
    })
  })

  it("matches negative paths", () => {
    expect(getMatch("-spacing.md")).toEqual({
      isNegative: "-",
      tokenTarget: "spacing.md",
      hasOpacity: undefined,
      opacityValue: undefined,
    })
  })

  it("matches paths with opacity", () => {
    expect(getMatch("color.primary.base/50")).toEqual({
      isNegative: "",
      tokenTarget: "color.primary.base",
      hasOpacity: "/50",
      opacityValue: "50",
    })
  })

  it("matches negative paths with opacity", () => {
    expect(getMatch("-color.primary.base/10")).toEqual({
      isNegative: "-",
      tokenTarget: "color.primary.base",
      hasOpacity: "/10",
      opacityValue: "10",
    })
  })

  it("does not match paths without a dot", () => {
    expect(getMatch("primary")).toBeNull()
  })
})
