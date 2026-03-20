import { defaultSizes } from "./defaults"
export const TOKEN_REGEX =
  /(-?)([a-zA-Z][a-zA-Z0-9_\-]*\.[a-zA-Z0-9_\-\.]+)(\/([0-9]+))?/g

export const formatTokenToCssVar = (
  isNegative: string,
  tokenTarget: string,
  opacityValue?: string,
) => {
  if (isNegative && opacityValue) {
    throw new Error(
      `Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -${tokenTarget}/${opacityValue}`,
    )
  }

  let formattedTarget = tokenTarget.replace(/\./g, "-")

  if (opacityValue) {
    if (isNegative) {
      throw new Error(`Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -${tokenTarget}/${opacityValue}`)
    }
    const a = Number(opacityValue) / 100
    return `rgba(var(--${formattedTarget}-rgb), ${a})`
  }

  if (tokenTarget.startsWith("size.")) {
    const sizeKey = tokenTarget.split(".")[1] as keyof typeof defaultSizes
    if (defaultSizes[sizeKey]) {
      const rawValue = defaultSizes[sizeKey]
      if (isNegative) {
         if (rawValue.endsWith("rem")) {
            return `-${rawValue}`
         }
         return `calc(${rawValue} * -1)`
      }
      return rawValue
    }
  }

  if (isNegative) {
    return `calc(var(--${formattedTarget}) * -1)`
  }

  return `var(--${formattedTarget})`
}
