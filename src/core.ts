import type { DeepPartial, StrictDeepPartial } from "./types"

export interface ThemeConfig<
  P extends Record<string, any>,
  S extends Record<string, any>,
> {
  breakpoints?: Record<string, string>
  primitives?: P
  semantics: S | ((primitives: P) => S)

  modes?: 
    | Record<string, DeepPartial<S>> 
    | ((primitives: P, semantics: S) => Record<string, DeepPartial<S>>)

  responsive?: 
    | Record<string, DeepPartial<S>> 
    | ((primitives: P, semantics: S) => Record<string, DeepPartial<S>>)
}

const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === "object" && !Array.isArray(item)
}

const toCssVar = (path: string[]) => `--${path.join("-")}`

const createCssVars = (
  obj: Record<string, any>,
  prefix: string[] = [],
  isReference = false
): string => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = [...prefix, key]

    if (isObject(value)) {
      return acc + createCssVars(value, newPath, isReference)
    }

    if (typeof value === "string" && value.includes("px")) {
      throw new Error(
        `Grammr Style: 'px' values are not allowed. Found '${value}' at path '${newPath.join(".")}'. Please use rem or em.`
      )
    }

    const finalValue = (isReference && typeof value === 'string' && value.includes('.')) 
      ? `var(--${value.replace(/\./g, "-")})` 
      : value;

    return acc + `${toCssVar(newPath)}: ${finalValue};\n`
  }, "")
}

export const createTheme = <
  P extends Record<string, any>,
  S extends Record<string, any>,
>(
  config: ThemeConfig<P, S>,
) => {
  const primitives = config.primitives || ({} as P)

  const semantics =
    typeof config.semantics === "function"
      ? (config.semantics as any)(primitives)
      : config.semantics

  const modes =
    typeof config.modes === "function"
      ? (config.modes as any)(primitives, semantics)
      : config.modes

  const responsive =
    typeof config.responsive === "function"
      ? (config.responsive as any)(primitives, semantics)
      : config.responsive

  const breakpoints = config.breakpoints

  // Generate Base Variables (e.g. :root or body)
  let cssText = `:root {\n`
  
  if (Object.keys(primitives).length > 0) {
    cssText += createCssVars(primitives)
  }

  cssText += createCssVars(semantics, [], true)
  cssText += `}\n`

  // Generate Mode Variables (e.g. [data-theme="dark"])
  if (modes) {
    Object.entries(modes).forEach(([modeName, modeTokens]) => {
      cssText += `\n[data-theme="${modeName}"] {\n${createCssVars(modeTokens as any, [], true)}}\n`
    })
  }

  // Generate Responsive Variables
  if (responsive && breakpoints) {
    Object.entries(responsive).forEach(([bpName, bpTokens]) => {
      const bpValue = breakpoints[bpName]
      if (bpValue) {
        cssText += `\n@media (min-width: ${bpValue}) {\n  :root {\n${createCssVars(
          bpTokens as any, [], true
        )
          .split("\n")
          .map(l => (l ? `    ${l}` : ""))
          .join("\n")}  }\n}\n`
      } else {
        console.warn(
          `Grammr Style: Breakpoint '${bpName}' was used in responsive options, but not defined in breakpoints.`
        )
      }
    })
  }

  return {
    cssText,
    tokens: semantics as S,
    primitives: primitives as P,
  }
}
