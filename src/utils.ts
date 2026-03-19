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

  let result = `var(--${tokenTarget.replace(/\./g, "-")})`
  if (opacityValue) {
    result = `var(--${tokenTarget.replace(/\./g, "-")}-${opacityValue})`
  }
  if (isNegative) {
    const baseVarName = result.match(/var\(--(.*?)\)/)?.[1] || tokenTarget.replace(/\./g, "-")
    result = `var(--${baseVarName}-negative)`
  }
  return result
}
