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
    formattedTarget += `-${opacityValue}`
  }

  if (isNegative) {
    formattedTarget += `-negative`
  }

  return `var(--${formattedTarget})`
}
