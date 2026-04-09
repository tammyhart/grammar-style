import type { TokenPath, ValidateTokenString } from "./types"
import { TOKEN_REGEX, formatTokenToCssVar } from "./utils"

const cache = new Map<string, string>()

// Adding TokenPath back to the union ensures the IDE always has tokens to suggest,
// while TS will still throw an error if T is an invalid literal.
/* v8 ignore next */
const token = <T extends string>(
  path: T extends TokenPath ? TokenPath : TokenPath | ValidateTokenString<T>
): string => {
  if (!path) {
    return ""
  }

  const safePath = String(path)

  if (cache.has(safePath)) {
    return cache.get(safePath)!
  }

  // Fast path to bypass regex if no dot logic exists
  if (!safePath.includes(".")) {
    return safePath
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
