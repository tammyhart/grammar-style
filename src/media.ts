import { loadConfigSync } from "./config"
import { createTheme } from "./core"
import type { AllowedBreakpoints, ThemeConfig, Register } from "./types"
import { media as genMedia, breakpoint as genBreakpoint, hasGenerated } from "./generated"

// Extract strongly typed breakpoints from the user's config if they defined the module augmentation
type Config = Register extends { theme: infer T } ? T : ThemeConfig<any, any>
type Breakpoints = AllowedBreakpoints<Config>

let memoizedMedia: Record<string, string> | null = hasGenerated ? genMedia : null
let memoizedBreakpoint: Record<string, string> | null = hasGenerated ? genBreakpoint : null

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"

const media: Record<Breakpoints, string> = hasGenerated 
  /* v8 ignore next */
  ? (genMedia as Record<Breakpoints, string>)
  : new Proxy({} as Record<Breakpoints, string>, {
  get(target, prop) {
    if (typeof prop === "symbol") return Reflect.get(target, prop)
    if (prop === "then" || prop === "__esModule") return undefined

    if (!memoizedMedia) {
      if (isBrowser) {
        throw new Error(
          "Grammar Style: The global 'media' export relies on Node.js to load your config natively. It cannot be used inside browser runtime components (like CSR styled-components). Please export 'media' from your framework adapter instead!",
        )
      }
      const config = loadConfigSync()
      if (!config) {
        throw new Error("Grammar Style: Could not find grammar.config.ts")
      }
      const theme = createTheme(config)
      memoizedMedia = theme.media
    }
    return memoizedMedia[prop as string]
  },
  ownKeys() {
    if (!memoizedMedia) {
      /* v8 ignore next */
      if (isBrowser) return []
      // Lazy-trigger evaluating the config to populate memoized keys
      const _trigger = (media as any)["sm"]
    }
    /* v8 ignore next */
    return memoizedMedia ? Object.keys(memoizedMedia) : []
  },
  has(target, prop) {
    if (typeof prop === "symbol") return Reflect.has(target, prop)
    if (!memoizedMedia) {
      /* v8 ignore next */
      if (isBrowser) return false
      /* v8 ignore next */
      const _trigger = (media as any)["sm"]
    }
    return prop in memoizedMedia!
  },
  set() {
    throw new Error("Grammar Style: The exported 'media' object is read-only.")
  },
  deleteProperty() {
    throw new Error("Grammar Style: The exported 'media' object is read-only.")
  },
  getOwnPropertyDescriptor(target, prop): PropertyDescriptor | undefined {
    if (typeof prop === "symbol") return undefined
    const val = (media as any)[prop]
    if (val === undefined) return undefined
    return { enumerable: true, configurable: true, value: val }
  },
})

export const breakpoint: Record<Breakpoints, string> = hasGenerated
  /* v8 ignore next */
  ? (genBreakpoint as Record<Breakpoints, string>)
  : new Proxy({} as Record<Breakpoints, string>, {
  get(target, prop) {
    if (typeof prop === "symbol") return Reflect.get(target, prop)
    if (prop === "then" || prop === "__esModule") return undefined

    if (!memoizedBreakpoint) {
      if (!memoizedMedia) {
        /* v8 ignore next 5 */
        if (isBrowser) {
          throw new Error(
            "Grammar Style: The global 'breakpoint' export relies on Node.js to load your config natively. It cannot be used inside browser runtime components (like CSR styled-components).",
          )
        }
        // Evaluate media natively first to hydrate the config
        /* v8 ignore next */
        const _trigger = (media as any)["sm"]
      }
      memoizedBreakpoint = {}
      for (const [key, value] of Object.entries(memoizedMedia!)) {
        memoizedBreakpoint[key] = value.replace("@media ", "")
      }
    }
    return memoizedBreakpoint[prop as string]
  },
  ownKeys() {
    if (!memoizedBreakpoint) {
      /* v8 ignore next 3 */
      if (isBrowser) return []
      // Lazy-trigger to populate the mapped breakpoint keys
      const _trigger = (breakpoint as any)["sm"]
    }
    /* v8 ignore next */
    return memoizedBreakpoint ? Object.keys(memoizedBreakpoint) : []
  },
  has(target, prop) {
    if (typeof prop === "symbol") return Reflect.has(target, prop)
    if (!memoizedBreakpoint) {
      /* v8 ignore next 2 */
      if (isBrowser) return false
      const _trigger = (breakpoint as any)["sm"]
    }
    return prop in memoizedBreakpoint!
  },
  set() {
    throw new Error("Grammar Style: The exported 'breakpoint' object is read-only.")
  },
  deleteProperty() {
    throw new Error("Grammar Style: The exported 'breakpoint' object is read-only.")
  },
  getOwnPropertyDescriptor(target, prop): PropertyDescriptor | undefined {
    if (typeof prop === "symbol") return undefined
    const val = (breakpoint as any)[prop]
    if (val === undefined) return undefined
    return { enumerable: true, configurable: true, value: val }
  },
})

export default media
