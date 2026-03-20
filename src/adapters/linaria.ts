import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const createLinariaTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  providedConfig?: ThemeConfig<P, S>
) => {
  const loadedConfig = (providedConfig || loadConfigSync()) as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  return theme
}

export default createLinariaTheme
