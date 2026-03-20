import { css } from "@linaria/core"
import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const createLinariaTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  ) => {
  const loadedConfig = loadConfigSync() as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  const globals = css`
    :global() {
      ${theme.cssText}
    }
  `

  return {
    ...theme,
    globals,
  }
}

export default createLinariaTheme
