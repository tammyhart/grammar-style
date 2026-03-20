import * as React from "react"
import { Global, css } from "@emotion/react"
import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const mapToEmotionVars = (
  obj: Record<string, unknown>,
  prefix: string[] = []
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (isObject(value)) {
      result[key] = mapToEmotionVars(value, [...prefix, key])
    } else {
      result[key] = `var(--${[...prefix, key].join("-")})`
    }
  })
  return result
}

const createEmotionTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  ) => {
  const loadedConfig = loadConfigSync() as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  // Returns a reusable React component using pure render functions to avoid forcing TSX parsing
  const GlobalThemeStyle = () =>
    React.createElement(Global, {
      styles: css`
        ${theme.cssText}
      `,
    })

  return {
    ...theme,
    GlobalThemeStyle,
    emotion: {
      primitives: mapToEmotionVars(theme.primitives as Record<string, unknown>) as P,
      semantics: mapToEmotionVars(theme.tokens as Record<string, unknown>) as S,
    },
  }
}

export default createEmotionTheme
