import type { TokenPath, ValidateTokenString } from "./types"
import { TOKEN_REGEX, formatTokenToCssVar } from "./utils"

const cache = new Map<string, string>()

type TokenInput<T extends string> = T extends TokenPath ? T : ValidateTokenString<T> extends T ? T : ValidateTokenString<T>

/* v8 ignore next */
const token = <T extends string>(path: TokenInput<T>): string => {
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
