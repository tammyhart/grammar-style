import { createGlobalStyle } from "styled-components"
import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const mapToStyledComponentsVars = (
  obj: Record<string, unknown>,
  prefix: string[] = []
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (isObject(value)) {
      result[key] = mapToStyledComponentsVars(value, [...prefix, key])
    } else {
      result[key] = `var(--${[...prefix, key].join("-")})`
    }
  })
  return result
}

const createStyledComponentsTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  providedConfig?: ThemeConfig<P, S>
) => {
  const loadedConfig = (providedConfig || loadConfigSync()) as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  // Explicitly casting the global CSS injection to any momentarily if 
  // complex DOM Types aren't loaded in the consuming project, though 
  // users using styled-components will inherently have react types
  const GlobalThemeStyle = createGlobalStyle`
    ${theme.cssText}
  `

  return {
    ...theme,
    GlobalThemeStyle,
    styledComponents: {
      primitives: mapToStyledComponentsVars(theme.primitives as Record<string, unknown>) as P,
      semantics: mapToStyledComponentsVars(theme.tokens as Record<string, unknown>) as S,
    },
  }
}

export default createStyledComponentsTheme
