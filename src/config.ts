import type { ThemeConfig, DeepPartial } from "./types"

export const loadConfig = async (
  cwd: string = process.cwd(),
): Promise<ThemeConfig<
  Record<string, unknown>,
  Record<string, unknown>
> | null> => {
  let resolve: any
  let createJiti: any
  try {
    if (typeof require !== "undefined") {
      resolve = eval(`require("node:path")`).resolve
      createJiti = eval(`require("jiti")`).createJiti
    } else {
      resolve = (await eval(`import("node:path")`)).resolve
      createJiti = (await eval(`import("jiti")`)).createJiti
    }
  } catch (e) {
    return null
  }
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
        | ThemeConfig<Record<string, unknown>, Record<string, unknown>>
        | {
            default: ThemeConfig<
              Record<string, unknown>,
              Record<string, unknown>
            >
          }

      // /* v8 ignore next */ required because jiti internally normalizes esm default wrappers unpredictably
      /* v8 ignore next */
      const config =
        parsedConfig && "default" in parsedConfig
          ? parsedConfig.default
          : parsedConfig
      return config
    } catch (e: unknown) {
      // Allow module not found, throw on syntax errors
      const err = e as { code?: string }
      if (
        err.code !== "MODULE_NOT_FOUND" &&
        err.code !== "ERR_MODULE_NOT_FOUND"
      ) {
        console.error(`Error loading ${file}:`, e)
        throw e
      }
    }
  }

  return null
}

export const loadConfigSync = (
  cwd: string = process.cwd(),
): ThemeConfig<Record<string, unknown>, Record<string, unknown>> | null => {
  let resolve: any
  let createJiti: any
  try {
    resolve = eval(`require("node:path")`).resolve
    createJiti = eval(`require("jiti")`).createJiti
  } catch (e) {
    return null
  }
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
      // @ts-ignore
      const parsedConfig = jiti(filePath) as
        | ThemeConfig<Record<string, unknown>, Record<string, unknown>>
        | {
            default: ThemeConfig<
              Record<string, unknown>,
              Record<string, unknown>
            >
          }

      const config =
        parsedConfig && "default" in parsedConfig
          ? parsedConfig.default
          : parsedConfig
      return config
    } catch (e: unknown) {
      // Allow module not found, throw on syntax errors
      const err = e as { code?: string }
      if (
        err.code !== "MODULE_NOT_FOUND" &&
        err.code !== "ERR_MODULE_NOT_FOUND"
      ) {
        console.error(`Error loading ${file}:`, e)
        throw e
      }
    }
  }

  return null
}
