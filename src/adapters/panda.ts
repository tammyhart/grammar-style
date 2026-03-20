import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const mapToPandaVars = (
  obj: Record<string, unknown>,
  prefix: string[] = []
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (isObject(value)) {
      result[key] = mapToPandaVars(value, [...prefix, key])
    } else {
      // Panda config object expects strings linking back to defined CSS variables
      result[key] = `var(--${[...prefix, key].join("-")})`
    }
  })
  return result
}

const createPandaTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  ) => {
  const loadedConfig = loadConfigSync() as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  return {
    ...theme,
    panda: {
      primitives: mapToPandaVars(theme.primitives as Record<string, unknown>) as P,
      semantics: mapToPandaVars(theme.tokens as Record<string, unknown>) as S,
    },
  }
}

export default createPandaTheme
