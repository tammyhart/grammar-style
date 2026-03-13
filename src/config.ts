import { resolve } from "node:path"
import { createJiti } from "jiti"
import type { ThemeConfig, DeepPartial } from "./types"
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
