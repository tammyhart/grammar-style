import { expect, test, vi } from "vitest"
import media, { breakpoint } from "./media"

vi.mock("./config", () => ({
  loadConfigSync: () => ({
    options: {
      breakpoints: {
        mobile: "20rem",
        tablet: "size.600"
      }
    },
    primitives: {
      size: {
        "600": "37.5rem"
      }
    },
    semantics: {}
  })
}))

test("media proxy evaluates and caches natively correctly", () => {
  expect(media.mobile).toBe("@media (min-width: 20rem)")
  expect(media.mobileMax).toBe("@media (max-width: calc(20rem - 1px))")
  
  // Tests dot path scaling resolution
  expect(media.tablet).toBe("@media (min-width: 37.5rem)")
  expect(media.tabletMax).toBe("@media (max-width: calc(37.5rem - 1px))")
})

test("breakpoint proxy efficiently mirrors conditions without @media wrapper", () => {
  expect(breakpoint.mobile).toBe("(min-width: 20rem)")
  expect(breakpoint.mobileMax).toBe("(max-width: calc(20rem - 1px))")
  
  expect(breakpoint.tablet).toBe("(min-width: 37.5rem)")
  expect(breakpoint.tabletMax).toBe("(max-width: calc(37.5rem - 1px))")
})
