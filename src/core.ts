import type { DeepPartial, StrictDeepPartial, ThemeConfig } from "./types"
import { defaultSizes, defaultBreakpoints } from "./defaults"
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
  const primitives = { 
    size: defaultSizes,
    ...(config.primitives || ({} as P))
  } as P & { size: typeof defaultSizes }

  const semantics = config.semantics
  const modes = config.modes
  const responsive = config.responsive

  const optionsBreakpoints = config.options?.breakpoints || {}
  const breakpoints: Record<string, string> = { ...defaultBreakpoints }

  Object.entries(optionsBreakpoints).forEach(([key, value]) => {
    breakpoints[key] = value as string
    
    // Auto-generate Max counterpart if not explicitly provided
    if (!key.endsWith("Max") && !(optionsBreakpoints as any)[`${key}Max`]) {
      const valStr = value as string
      if (valStr.startsWith("size.")) {
        breakpoints[`${key}Max`] = `${valStr} - size.1`
      } else if (valStr.endsWith("rem")) {
        const num = parseFloat(valStr)
        breakpoints[`${key}Max`] = `${num - 0.0625}rem`
      }
    }
  })

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
      let bpValue = breakpoints[bpName as keyof typeof breakpoints] as string
      if (bpValue) {
        let bpValueStr = bpValue as string;

        // Resolve math evaluation like "size.800 - size.1" natively into rem calculations
        if (bpValueStr.includes(' - ')) {
          const [left, right] = bpValueStr.split(' - ');
          if (left.startsWith('size.') && right.startsWith('size.') && primitives.size) {
            const key1 = left.split('.')[1] as keyof typeof primitives.size;
            const key2 = right.split('.')[1] as keyof typeof primitives.size;
            
            const val1 = primitives.size[key1] as string | undefined;
            const val2 = primitives.size[key2] as string | undefined;

            if (val1 && val2) {
              const num1 = parseFloat(val1);
              const num2 = parseFloat(val2);
              bpValueStr = `${num1 - num2}rem`;
            }
          }
        } 
        // Resolve standard "size.800"
        else if (bpValueStr.startsWith('size.') && primitives.size) {
          const sizeKey = bpValueStr.split('.')[1] as keyof typeof primitives.size;
          if (primitives.size[sizeKey]) {
            bpValueStr = primitives.size[sizeKey] as string;
          }
        }

        const condition = bpName.endsWith("Max") ? `max-width` : `min-width`;
        
        cssText += `\n@media (${condition}: ${bpValueStr}) {\n  :root {\n${createCssVars(
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
