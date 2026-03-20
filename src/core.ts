import type { ThemeConfig, AllowedBreakpoints } from "./types"
import { defaultSizes, defaultBreakpoints, defaultOpacities } from "./defaults"
import { TOKEN_REGEX } from "./utils"
const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const toCssVar = (path: string[]) => `--${path.join("-")}`

const createCssVars = (
  obj: Record<string, unknown>,
  prefix: string[] = [],
  isReference = false,
  primitives?: Record<string, unknown>,
  semantics?: Record<string, unknown>
): string => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = [...prefix, key]

    if (isObject(value)) {
      return acc + createCssVars(value, newPath, isReference, primitives, semantics)
    }

    if (typeof value === "string" && value.includes("px")) {
      throw new Error(
        `Grammr Style: 'px' values are not allowed. Found '${value}' at path '${newPath.join(".")}'. Please use rem or em.`,
      )
    }

    let finalValue = value;
    if (typeof value === "string" && value.includes(".")) {
      finalValue = value.replace(
        TOKEN_REGEX,
        (match, isNegative, tokenTarget, hasOpacity, opacityValue) => {
          let result = `var(--${tokenTarget.replace(/\./g, "-")})`
          if (tokenTarget.startsWith("size.")) {
            const sizeKey = tokenTarget.split(".")[1] as keyof typeof defaultSizes
            if (defaultSizes[sizeKey]) {
              const rawValue = defaultSizes[sizeKey]
              if (isNegative) {
                 if (rawValue.endsWith("rem")) return `-${rawValue}`
                 return `calc(${rawValue} * -1)`
              }
              return rawValue
            }
          }
          if (isNegative && hasOpacity) {
            throw new Error(`Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -${tokenTarget}/${opacityValue}`);
          }
          if (hasOpacity) {
            const a = Number(opacityValue) / 100;
            result = `rgba(var(--${tokenTarget.replace(/\./g, "-")}-rgb), ${a})`;
          }
          if (isNegative) {
             result = `calc(${result} * -1)`;
          }
          return result;
        }
      );
    }

    let cssLine = `${toCssVar(newPath)}: ${finalValue};\n`;

    if (typeof finalValue === "string" && newPath[0] === "color") {
       let current = finalValue.trim();
       if (current.startsWith("var(--")) {
          const innerVar = current.match(/var\((--.*?)\)/)?.[1];
          if (innerVar && innerVar.startsWith("--color-")) {
             cssLine += `${toCssVar(newPath)}-rgb: var(${innerVar}-rgb);\n`;
          }
       } else if (current.startsWith("#")) {
          let hex = current.substring(1);
          if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(x => x + x).join('');
          if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            cssLine += `${toCssVar(newPath)}-rgb: ${r}, ${g}, ${b};\n`;
          }
       }
    }

    return acc + cssLine;
  }, "")
}




export const createTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>,
>(
  config: ThemeConfig<P, S>,
) => {
  if (config.primitives && 'size' in config.primitives) {
    throw new Error("Grammar Style: The 'size' primitive is a strict geometric constant and cannot be overridden. Please remove 'size' from your config.primitives.")
  }

  const optionsBreakpoints = config.options?.breakpoints || {}

  const hasOnlyDefaultOverrides = Object.keys(optionsBreakpoints).every(
    key => key in defaultBreakpoints,
  )

  const breakpoints: Record<string, string> =
    hasOnlyDefaultOverrides ? { ...defaultBreakpoints } : {}

  Object.entries(optionsBreakpoints).forEach(([key, value]) => {
    breakpoints[key] = value as string

    // Auto-generate Max counterpart if not explicitly provided
    if (
      !key.endsWith("Max") &&
      !(optionsBreakpoints as Record<string, string>)[`${key}Max`]
    ) {
      const valStr = value as string
      if (valStr.startsWith("size.")) {
        breakpoints[`${key}Max`] = `calc(${valStr} - 1px)`
      } else if (valStr.endsWith("rem")) {
        breakpoints[`${key}Max`] = `calc(${valStr} - 1px)`
      }
    }
  })

  const optionsOpacities = config.options?.opacities || []

  optionsOpacities.forEach((val: number) => {
    if (val > 100 || val < 0) {
      throw new Error(
        `Grammr Style: Opacity values must be between 0 and 100. Found '${val}' in options.opacities.`,
      )
    }
  })

  const primitives = {
    size: defaultSizes,
    ...(config.primitives || ({} as P)),
  } as P & { size: typeof defaultSizes }

  const semantics = config.semantics
  const modes = config.modes
  const responsive = config.responsive

  const primitivesForCss = { ...primitives } as P & {
    size?: Record<string, string>
  }
  
  delete primitivesForCss.size

  let rootCssText = ""
  if (Object.keys(primitivesForCss).length > 0) {
    rootCssText += createCssVars(primitivesForCss, [], false, primitivesForCss, semantics as any)
  }

  rootCssText += createCssVars(semantics, [], true, primitivesForCss, semantics as any)

  // Generate Mode Variables (e.g. [data-theme="dark"])
  let modesCssText = ""
  if (modes) {
    Object.entries(modes).forEach(([modeName, modeTokens]) => {
      modesCssText += `\n[data-theme="${modeName}"] {\n${createCssVars(modeTokens as Record<string, unknown>, [], true, primitivesForCss, semantics as any)}}\n`
    })
  }

  // Generate Responsive Variables
  let responsiveCssText = ""
  if (responsive && breakpoints) {
    Object.entries(responsive).forEach(([bpName, bpTokens]) => {
      let bpValue = breakpoints[bpName as keyof typeof breakpoints] as string
      if (bpValue) {
        let bpValueStr = bpValue as string

        // Resolve max-width math evaluation like "calc(size.800 - 1px)" naturally
        if (bpValueStr.startsWith("calc(") && bpValueStr.includes(" - 1px)")) {
          let innerToken = bpValueStr.replace("calc(", "").replace(" - 1px)", "")
          if (innerToken.startsWith("size.") && primitives.size) {
            const sizeKey = innerToken.split(".")[1] as keyof typeof primitives.size
            if (primitives.size[sizeKey]) {
              innerToken = primitives.size[sizeKey] as string
            }
          }
          bpValueStr = `calc(${innerToken} - 1px)`
        }
        // Resolve standard "size.800"
        else if (bpValueStr.startsWith("size.") && primitives.size) {
          const sizeKey = bpValueStr.split(
            ".",
          )[1] as keyof typeof primitives.size
          if (primitives.size[sizeKey]) {
            bpValueStr = primitives.size[sizeKey] as string
          }
        }

        const condition = bpName.endsWith("Max") ? `max-width` : `min-width`

        responsiveCssText += `\n@media (${condition}: ${bpValueStr}) {\n  :root {\n${createCssVars(
          bpTokens as Record<string, unknown>,
          [],
          true,
          primitivesForCss,
          semantics as any
        )
          .split("\n")
          .map(l => (l ? `    ${l}` : ""))
          .join("\n")}  }\n}\n`
      } else {
        console.warn(
          `Grammr Style: Breakpoint '${bpName}' was used in responsive options, but not defined in breakpoints.`,
        )
      }
    })
  }

  // Assemble Final Text
  let cssText = `:root {\n`
  cssText += rootCssText
  cssText += `}\n`
  cssText += modesCssText
  cssText += responsiveCssText

  const media: Record<string, string> = {}
  Object.entries(breakpoints).forEach(([bpName, bpValue]) => {
    let bpValueStr = bpValue as string

    if (bpValueStr.startsWith("calc(") && bpValueStr.includes(" - 1px)")) {
      let innerToken = bpValueStr.replace("calc(", "").replace(" - 1px)", "")
      if (innerToken.startsWith("size.") && primitives.size) {
        const sizeKey = innerToken.split(".")[1] as keyof typeof primitives.size
        if (primitives.size[sizeKey]) {
          innerToken = primitives.size[sizeKey] as string
        }
      }
      bpValueStr = `calc(${innerToken} - 1px)`
    } else if (bpValueStr.startsWith("size.") && primitives.size) {
      const sizeKey = bpValueStr.split(".")[1] as keyof typeof primitives.size
      if (primitives.size[sizeKey]) {
        bpValueStr = primitives.size[sizeKey] as string
      }
    }

    const condition = bpName.endsWith("Max") ? `max-width` : `min-width`
    media[bpName] = `@media (${condition}: ${bpValueStr})`
  })

  return {
    cssText,
    tokens: semantics as S,
    primitives: primitives as P,
    media: media as Record<AllowedBreakpoints<ThemeConfig<P, S>>, string>,
  }
}
