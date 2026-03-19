import type { TokenPath } from "./types"
import { TOKEN_REGEX, formatTokenToCssVar } from "./utils"

const token = (path: TokenPath): string => {
  if (!path) return ""

  const safePath = String(path)

  return safePath.replace(
    TOKEN_REGEX,
    (
      match: string,
      isNegative: string,
      tokenTarget: string,
      hasOpacity: string,
      opacityValue: string,
    ) => {
      return formatTokenToCssVar(isNegative, tokenTarget, opacityValue)
    }
  )
}

export default token
