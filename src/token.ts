import type { TokenPath, ValidateTokenString } from "./types"
import { TOKEN_REGEX, formatTokenToCssVar } from "./utils"

const cache = new Map<string, string>()

const token = <T extends string>(
  path: T extends TokenPath ? T : ValidateTokenString<T> extends T ? T : ValidateTokenString<T>
): string => {
  if (!path) return ""

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
