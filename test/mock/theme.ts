import { css } from "@linaria/core"

import { cssVars } from "./tokens"
import { media } from "./utils"

const themeStyles = css`
  :global() {
    :root {
      ${cssVars.common}
      ${cssVars.dark}
    }

    [data-theme="light"] {
      ${cssVars.light}
    }

    ${media.lap} {
      :root {
        ${cssVars.lap}
      }
    }

    ${media.wall} {
      :root {
        ${cssVars.wall}
      }
    }
  }
`

export default themeStyles
