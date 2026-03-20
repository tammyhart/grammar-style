import { createTheme } from "../core"
import type { ThemeConfig } from "../types"

const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const mapToVanillaExtractVars = (
  obj: Record<string, unknown>,
  prefix: string[] = []
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (isObject(value)) {
      result[key] = mapToVanillaExtractVars(value, [...prefix, key])
    } else {
      // Vanilla Extract safely handles raw mapped CSS variables within `style({})` calls
      result[key] = `var(--${[...prefix, key].join("-")})`
    }
  })
  return result
}

const createVanillaExtractTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  config: ThemeConfig<P, S>
) => {
  const theme = createTheme(config)

  return {
    ...theme,
    vanillaExtract: {
      primitives: mapToVanillaExtractVars(theme.primitives as Record<string, unknown>) as P,
      semantics: mapToVanillaExtractVars(theme.tokens as Record<string, unknown>) as S,
    },
  }
}

export default createVanillaExtractTheme
