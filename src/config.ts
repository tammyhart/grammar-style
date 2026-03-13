import { resolve } from "node:path"
import { createJiti } from "jiti"
import type { ThemeConfig } from "./core"
import type { DeepPartial } from "./types"

// Helper to ensure TypeScript strictly compares the user's string keys against the Semantic object literal
// This provides a friendly, human-readable error EXACTLY on the misspelled key in their editor!
type Exactly<T, Expected> = T & {
  [K in keyof T]: K extends keyof Expected ?
    Expected[K] extends object ?
      Exactly<T[K], Expected[K]>
    : Expected[K]
  : "Error: This property does not exist in your semantics shape"
}

// Optional helper for users to get autocomplete in their config file without importing createTheme
export function defineGrammar<
  P extends Record<string, any>,
  S extends Record<string, any>,
  M extends Record<string, any> = {},
  R extends Record<string, any> = {},
>(config: {
  breakpoints?: Record<string, string>
  primitives?: P
  semantics: (primitives: P) => S
  modes?: (
    primitives: P,
    semantics: S,
  ) => M & Exactly<M, Record<string, DeepPartial<S>>>
  responsive?: (
    primitives: P,
    semantics: S,
  ) => R & Exactly<R, Record<string, DeepPartial<S>>>
}): ThemeConfig<P, S> {
  return config as any
}

export const loadConfig = async (
  cwd: string = process.cwd(),
): Promise<ThemeConfig<any, any> | null> => {
  const jiti = createJiti(cwd)

  const configFiles = [
    "grammar.config.ts",
    "grammar.config.mts",
    "grammar.config.js",
    "grammar.config.mjs",
    "grammar.config.cjs",
  ]

  for (const file of configFiles) {
    const filePath = resolve(cwd, file)
    try {
      // Jiti resolves TS and ESM in Node natively
      const parsedConfig = (await jiti.import(filePath, { default: true })) as
        | ThemeConfig<any, any>
        | { default: ThemeConfig<any, any> }

      const config =
        "default" in parsedConfig ? parsedConfig.default : parsedConfig
      return config
    } catch (e: any) {
      // Allow module not found, throw on syntax errors
      if (e.code !== "MODULE_NOT_FOUND" && e.code !== "ERR_MODULE_NOT_FOUND") {
        console.error(`Error loading ${file}:`, e)
        throw e
      }
    }
  }

  return null
}
