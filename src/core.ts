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
  customOpacitiesOut?: Record<string, string>
): string => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = [...prefix, key]

    if (isObject(value)) {
      return acc + createCssVars(value, newPath, isReference, primitives, customOpacitiesOut)
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
          const cssVar = `var(--${tokenTarget.replace(/\./g, "-")})`;
          let result = cssVar;
          if (isNegative && hasOpacity) {
            throw new Error(`Grammr Style: Token cannot mathematically be both negative and have opacity. Found: -${tokenTarget}/${opacityValue}`);
          }
          if (hasOpacity) {
            let rgbaResolved = false;
            if (primitives && opacityValue) {
              const parts = tokenTarget.split('.');
              let current: any = primitives;
              for (const part of parts) {
                if (current && typeof current === 'object') current = current[part];
                else { current = undefined; break; }
              }
              if (typeof current === 'string') {
                const a = Number(opacityValue) / 100;
                let convertedString: string | null = null;
                
                if (current.startsWith('#')) {
                  let hex = current.substring(1);
                  if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(x => x + x).join('');
                  if (hex.length === 6 || hex.length === 8) {
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    let finalA = a;
                    if (hex.length === 8) {
                      finalA = a * (parseInt(hex.slice(6, 8), 16) / 255);
                    }
                    convertedString = `rgba(${r}, ${g}, ${b}, ${parseFloat(finalA.toFixed(4))})`;
                  }
                } else if (current.startsWith('hsl') || current.startsWith('rgb')) {
                  const inner = current.match(/\((.*)\)/)?.[1];
                  if (inner) {
                    const parts = inner.split(/[\s,]+/).filter(Boolean);
                    if (parts.length >= 3) {
                       const p1 = parts[0];
                       const p2 = parts[1];
                       const p3 = parts[2];
                       if (current.startsWith('hsl')) {
                         convertedString = `hsla(${p1}, ${p2}, ${p3}, ${a})`;
                       } else {
                         convertedString = `rgba(${p1}, ${p2}, ${p3}, ${a})`;
                       }
                    }
                  }
                }

                if (convertedString) {
                  if (customOpacitiesOut) {
                    const customVarName = `--${tokenTarget.replace(/\./g, "-")}-${opacityValue}`;
                    customOpacitiesOut[customVarName] = convertedString;
                    result = `var(${customVarName})`;
                  } else {
                    result = convertedString;
                  }
                  rgbaResolved = true;
                }
              }
            }
            if (!rgbaResolved) {
              throw new Error(`Grammr Style: Unable to parse primitive '${tokenTarget}' for opacity transform. Supported formats are Hex, rgb(), rgba(), hsl(), hsla().`);
            }
          }
          if (isNegative) {
            if (customOpacitiesOut) {
              const baseVarName = result.match(/var\(--(.*?)\)/)?.[1] || tokenTarget.replace(/\./g, "-");
              const customVarName = `--${baseVarName}-negative`;
              customOpacitiesOut[customVarName] = `calc(${result} * -1)`;
              result = `var(${customVarName})`;
            } else {
              result = `calc(${result} * -1)`;
            }
          }
          return result;
        }
      );
    }

    return acc + `${toCssVar(newPath)}: ${finalValue};\n`
  }, "")
}

const getUsedTokens = (
  config: ThemeConfig<Record<string, unknown>, Record<string, unknown>>,
): Set<string> => {
  const used = new Set<string>()

  const scanObj = (obj: unknown) => {
    if (typeof obj === "string") {
      const match = obj.match(new RegExp(TOKEN_REGEX.source, "g"))
      if (match) match.forEach(m => used.add(m))
    } else if (Array.isArray(obj)) {
      obj.forEach(scanObj)
    } else if (isObject(obj)) {
      Object.values(obj).forEach(scanObj)
    }
  }

  scanObj(config.semantics)
  scanObj(config.modes)
  scanObj(config.responsive)

  let fs:
    | {
        existsSync: (path: string) => boolean
        statSync: (path: string) => { isDirectory: () => boolean }
        readdirSync: (path: string) => string[]
        readFileSync: (path: string, options: string) => string
      }
    | undefined
  let path:
    | {
        join: (...paths: string[]) => string
        resolve: (...paths: string[]) => string
      }
    | undefined
  try {
    const f = "node" + ":" + "fs"
    const p = "node" + ":" + "path"
    fs = eval(`require('${f}')`)
    path = eval(`require('${p}')`)
  } catch (e) {}

  if (fs && path && typeof process !== 'undefined' && process.cwd) {
    const cwd = process.cwd()
    const contentPaths = config.options?.content || [
      "./src",
      "./app",
      "./pages",
      "./components",
      "./lib",
    ]

    const getFiles = (dir: string): string[] => {
      let results: string[] = []
      try {
        if (!fs.existsSync(dir)) return results
        const stat = fs.statSync(dir)
        if (!stat.isDirectory()) {
          results.push(dir)
          return results
        }

        const list = fs.readdirSync(dir)
        list.forEach((file: string) => {
          if (
            file === "node_modules" ||
            file.startsWith(".") ||
            file.startsWith("dist") ||
            file.startsWith("build")
          )
            return
          const filePath = path.join(dir, file)
          try {
            const stat = fs.statSync(filePath)
            if (stat && stat.isDirectory()) {
              results = results.concat(getFiles(filePath))
            } else if (file.match(/\.(tsx?|jsx?|mdx?|html?|vue|svelte)$/)) {
              results.push(filePath)
            }
          } catch (e) {
            console.warn("Grammar Style scanner dir reading: " + e)
          }
        })
      } catch (e) {
        console.warn("Grammar Style scanner file reading: " + e)
      }
      return results
    }

    const filesToScan: string[] = []
    contentPaths.forEach((p: string) => {
      filesToScan.push(...getFiles(path.resolve(cwd, p)))
    })

    const scannerRegex = new RegExp(TOKEN_REGEX.source, "g")
    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, "utf8")
        const matches = content.match(scannerRegex)
        if (matches) {
          matches.forEach((m: string) => used.add(m))
        }
      } catch (e) {
        console.warn("Grammar Style content reading: " + e)
      }
    })
  }

  return used
}

export const createTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>,
>(
  config: ThemeConfig<P, S>,
) => {
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

  const customOpacitiesOut: Record<string, string> = {}
  
  const usedTokens = getUsedTokens(
    config as ThemeConfig<Record<string, unknown>, Record<string, unknown>>,
  )
  const primitivesForCss = { ...primitives } as P & {
    size?: Record<string, string>
  }

  const tokenRegexScanner = new RegExp(TOKEN_REGEX.source, "g");
  Array.from(usedTokens).forEach(t => {
     let tempObj = { value: t };
     try {
       createCssVars(tempObj as any, [], true, primitivesForCss as any, customOpacitiesOut);
     } catch(e) {}
     t.replace(tokenRegexScanner, (match, isNegative, tokenTarget) => {
        usedTokens.add(tokenTarget);
        if (isNegative) usedTokens.add(`-${tokenTarget}`);
        return match;
     });
  });

  if (primitivesForCss.size) {
    const filteredSizes: Record<string, string> = {}
    Object.entries(primitivesForCss.size).forEach(([key, value]) => {
      const isPosUsed = usedTokens.has(`size.${key}`) || usedTokens.has(key)
      const isNegUsed = usedTokens.has(`-size.${key}`)
      
      if (isPosUsed || isNegUsed) {
        filteredSizes[key] = value as string
      }
      
      if (isNegUsed) {
        customOpacitiesOut[`--size-${key}-negative`] = `calc(var(--size-${key}) * -1)`
      }
    })
    primitivesForCss.size = filteredSizes
  }

  let rootCssText = ""
  if (Object.keys(primitivesForCss).length > 0) {
    rootCssText += createCssVars(primitivesForCss, [], false, primitivesForCss, customOpacitiesOut)
  }

  rootCssText += createCssVars(semantics, [], true, primitivesForCss, customOpacitiesOut)

  // Generate Mode Variables (e.g. [data-theme="dark"])
  let modesCssText = ""
  if (modes) {
    Object.entries(modes).forEach(([modeName, modeTokens]) => {
      modesCssText += `\n[data-theme="${modeName}"] {\n${createCssVars(modeTokens as Record<string, unknown>, [], true, primitivesForCss, customOpacitiesOut)}}\n`
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
          customOpacitiesOut
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
  Object.entries(customOpacitiesOut).forEach(([varName, val]) => {
    cssText += `${varName}: ${val};\n`
  })
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
