import type { TokenPath } from "./types"
import { TOKEN_REGEX, formatTokenToCssVar } from "./utils"

const cache = new Map<string, string>()

const token = (path: TokenPath): string => {
  if (!path) return ""

  const safePath = String(path)

  if (cache.has(safePath)) {
    return cache.get(safePath)!
  }

  const result = safePath.replace(
    TOKEN_REGEX,
    (
      match: string,
      isNegative: string,
      tokenTarget: string,
      hasOpacity: string,
      opacityValue: string,
    ) => {
      return formatTokenToCssVar(isNegative, tokenTarget, opacityValue)
    },
  )

  cache.set(safePath, result)
  return result
}

export default token
