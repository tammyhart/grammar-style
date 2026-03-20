import { expect, test, vi, beforeEach, afterEach } from "vitest"
import media, { breakpoint } from "./media"

vi.mock("./config", () => ({
  loadConfigSync: vi.fn(() => ({
    options: { breakpoints: { mobile: "20rem", tablet: "size.600" } },
    primitives: { size: { "600": "37.5rem" } },
    semantics: {}
  }))
}))

beforeEach(() => {
  // Note: Proxies are already initialized from previous tests, but Vitest
  // evaluates them within the global module scope of the runner.
})

test("media proxy evaluates and caches natively correctly", () => {
  expect(media.mobile).toBe("@media (min-width: 20rem)")
  expect(media.mobileMax).toBe("@media (max-width: calc(20rem - 1px))")
  
  // Tests dot path scaling resolution
  expect(media.tablet).toBe("@media (min-width: 37.5rem)")
  expect(media.tabletMax).toBe("@media (max-width: calc(37.5rem - 1px))")
})

test("breakpoint proxy efficiently mirrors conditions without @media wrapper", () => {
  expect(breakpoint.mobile).toBe("(min-width: 20rem)")
  expect(breakpoint.tablet).toBe("(min-width: 37.5rem)")
})

test("media proxy throws read-only architecture errors on mutation", () => {
  // @ts-ignore
  expect(() => { media.mobile = "foo" }).toThrow("read-only")
  // @ts-ignore
  expect(() => { delete media.mobile }).toThrow("read-only")
  
  // @ts-ignore
  expect(() => { breakpoint.mobile = "foo" }).toThrow("read-only")
  // @ts-ignore
  expect(() => { delete breakpoint.mobile }).toThrow("read-only")
})

test("proxy reflects correct boolean presence utilizing the 'has' trap", () => {
  expect("mobile" in media).toBe(true)
  expect("mobileMax" in media).toBe(true)
  expect("foo" in media).toBe(false)

  expect("mobile" in breakpoint).toBe(true)
  expect("mobileMax" in breakpoint).toBe(true)
  expect("foo" in breakpoint).toBe(false)
})

test("proxy correctly loops mappings using ownKeys and descriptors", () => {
  const keys = Object.keys(media)
  expect(keys).toContain("mobile")
  expect(keys).toContain("tabletMax")
  
  const bKeys = Object.keys(breakpoint)
  expect(bKeys).toContain("tablet")
  expect(bKeys).toContain("mobileMax")
  
  // Checking exact enumeration structure
  expect(Object.getOwnPropertyDescriptor(media, "mobile")?.enumerable).toBe(true)
  // Ensure non-existent fetches don't break strict TS iteration
  expect(Object.getOwnPropertyDescriptor(media, "foo")).toBeUndefined()
  
  expect(Object.getOwnPropertyDescriptor(breakpoint, "mobile")?.enumerable).toBe(true)
  expect(Object.getOwnPropertyDescriptor(breakpoint, "foo")).toBeUndefined()
})
