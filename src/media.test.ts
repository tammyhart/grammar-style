import { expect, test, vi, beforeEach, afterEach } from "vitest"
import media, { breakpoint } from "./media"

vi.mock("./config", () => ({
  loadConfigSync: vi.fn(() => ({
    options: { breakpoints: { mobile: "20rem", tablet: "size.600" } },
    primitives: {},
    semantics: {}
  }))
}))

beforeEach(() => {
  // Note: Proxies are already initialized from previous tests, but Vitest
  // evaluates them within the global module scope of the runner.
})

test("media proxy evaluates and caches natively correctly", () => {
  const m = media as unknown as Record<string, string>
  expect(m.mobile).toBe("@media (min-width: 20rem)")
  expect(m.mobileMax).toBe("@media (max-width: calc(20rem - 1px))")
  
  // Tests dot path scaling resolution
  expect(m.tablet).toBe("@media (min-width: 37.5rem)")
  expect(m.tabletMax).toBe("@media (max-width: calc(37.5rem - 1px))")
})

test("breakpoint proxy efficiently mirrors conditions without @media wrapper", () => {
  const b = breakpoint as unknown as Record<string, string>
  expect(b.mobile).toBe("(min-width: 20rem)")
  expect(b.tablet).toBe("(min-width: 37.5rem)")
})

test("media proxy throws read-only architecture errors on mutation", () => {
  const m = media as unknown as Record<string, string>
  const b = breakpoint as unknown as Record<string, string>
  // @ts-ignore
  expect(() => { m.mobile = "foo" }).toThrow("read-only")
  // @ts-ignore
  expect(() => { delete m.mobile }).toThrow("read-only")
  
  // @ts-ignore
  expect(() => { b.mobile = "foo" }).toThrow("read-only")
  // @ts-ignore
  expect(() => { delete b.mobile }).toThrow("read-only")
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

test("proxy deeply handles native JS engine Symbol checks transparently", () => {
  expect((media as any).then).toBeUndefined()
  expect((breakpoint as any).then).toBeUndefined()
  expect((media as any).__esModule).toBeUndefined()
  expect((breakpoint as any).__esModule).toBeUndefined()
  
  expect(Symbol.iterator in media).toBe(false)
  expect(Symbol.iterator in breakpoint).toBe(false)
  
  expect(Object.getOwnPropertyDescriptor(media, Symbol.iterator)).toBeUndefined()
  expect(Object.getOwnPropertyDescriptor(breakpoint, Symbol.iterator)).toBeUndefined()
})
