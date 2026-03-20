import { css } from "@linaria/core"
import { createTheme } from "../core"
import type { ThemeConfig } from "../types"

const createLinariaTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  config: ThemeConfig<P, S>
) => {
  const theme = createTheme(config)

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
