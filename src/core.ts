import type { ThemeConfig } from "./types"
import { defaultSizes, defaultBreakpoints } from "./defaults"
const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const toCssVar = (path: string[]) => `--${path.join("-")}`

const createCssVars = (
  obj: Record<string, unknown>,
  prefix: string[] = [],
  isReference = false,
): string => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = [...prefix, key]

    if (isObject(value)) {
      return acc + createCssVars(value, newPath, isReference)
    }

    if (typeof value === "string" && value.includes("px")) {
      throw new Error(
        `Grammr Style: 'px' values are not allowed. Found '${value}' at path '${newPath.join(".")}'. Please use rem or em.`,
      )
    }

    const finalValue =
      isReference && typeof value === "string" && value.includes(".") ?
        `var(--${value.replace(/\./g, "-")})`
      : value

    return acc + `${toCssVar(newPath)}: ${finalValue};\n`
  }, "")
}

const getUsedSizes = (config: ThemeConfig<Record<string, unknown>, Record<string, unknown>>): Set<string> => {
  const used = new Set<string>()

  const scanObj = (obj: unknown) => {
    if (typeof obj === "string") {
      const match = obj.match(/size\.([A-Za-z0-9\-\.]+)/g)
      if (match) match.forEach(m => used.add(m.replace("size.", "")))
    } else if (Array.isArray(obj)) {
      obj.forEach(scanObj)
    } else if (isObject(obj)) {
      Object.values(obj).forEach(scanObj)
    }
  }

  scanObj(config.semantics)
  scanObj(config.modes)
  scanObj(config.responsive)

  let fs: { existsSync: (path: string) => boolean; statSync: (path: string) => { isDirectory: () => boolean }; readdirSync: (path: string) => string[]; readFileSync: (path: string, options: string) => string } | undefined
  let path: { join: (...paths: string[]) => string; resolve: (...paths: string[]) => string } | undefined
  try {
    fs = eval(`require('node:fs')`)
    path = eval(`require('node:path')`)
  } catch (e) {}

  if (fs && path) {
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
          } catch (e) {}
        })
      } catch (e) {}
      return results
    }

    const filesToScan: string[] = []
    contentPaths.forEach((p: string) => {
      filesToScan.push(...getFiles(path.resolve(cwd, p)))
    })

    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, "utf8")
        const matches = content.match(/size\.([A-Za-z0-9\-]+)/g)
        if (matches) {
          matches.forEach((m: string) => used.add(m.replace("size.", "")))
        }
      } catch (e) {}
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
    key => key in defaultBreakpoints
  )

  const breakpoints: Record<string, string> = hasOnlyDefaultOverrides 
    ? { ...defaultBreakpoints } 
    : {}

  Object.entries(optionsBreakpoints).forEach(([key, value]) => {
    breakpoints[key] = value as string

    // Auto-generate Max counterpart if not explicitly provided
    if (!key.endsWith("Max") && !(optionsBreakpoints as Record<string, string>)[`${key}Max`]) {
      const valStr = value as string
      if (valStr.startsWith("size.")) {
        breakpoints[`${key}Max`] = `${valStr} - size.1`
      } else if (valStr.endsWith("rem")) {
        const num = parseFloat(valStr)
        breakpoints[`${key}Max`] = `${num - 0.0625}rem`
      }
    }
  })

  const primitives = {
    size: defaultSizes,
    ...(config.primitives || ({} as P)),
  } as P & { size: typeof defaultSizes }

  const semantics = config.semantics
  const modes = config.modes
  const responsive = config.responsive

  // Generate Base Variables (e.g. :root or body)
  let cssText = `:root {\n`

  const usedSizes = getUsedSizes(config as ThemeConfig<Record<string, unknown>, Record<string, unknown>>)
  const primitivesForCss = { ...primitives } as P & { size?: Record<string, string> }

  if (usedSizes.size > 0 && primitivesForCss.size) {
    const filteredSizes: Record<string, string> = {}
    Object.entries(primitivesForCss.size).forEach(([key, value]) => {
      if (usedSizes.has(key)) {
        filteredSizes[key] = value as string
      }
    })
    primitivesForCss.size = filteredSizes
  }

  if (Object.keys(primitivesForCss).length > 0) {
    cssText += createCssVars(primitivesForCss)
  }

  cssText += createCssVars(semantics, [], true)
  cssText += `}\n`

  // Generate Mode Variables (e.g. [data-theme="dark"])
  if (modes) {
    Object.entries(modes).forEach(([modeName, modeTokens]) => {
      cssText += `\n[data-theme="${modeName}"] {\n${createCssVars(modeTokens as Record<string, unknown>, [], true)}}\n`
    })
  }

  // Generate Responsive Variables
  if (responsive && breakpoints) {
    Object.entries(responsive).forEach(([bpName, bpTokens]) => {
      let bpValue = breakpoints[bpName as keyof typeof breakpoints] as string
      if (bpValue) {
        let bpValueStr = bpValue as string

        // Resolve math evaluation like "size.800 - size.1" natively into rem calculations
        if (bpValueStr.includes(" - ")) {
          const [left, right] = bpValueStr.split(" - ")
          if (
            left.startsWith("size.") &&
            right.startsWith("size.") &&
            primitives.size
          ) {
            const key1 = left.split(".")[1] as keyof typeof primitives.size
            const key2 = right.split(".")[1] as keyof typeof primitives.size

            const val1 = primitives.size[key1] as string | undefined
            const val2 = primitives.size[key2] as string | undefined

            if (val1 && val2) {
              const num1 = parseFloat(val1)
              const num2 = parseFloat(val2)
              bpValueStr = `${num1 - num2}rem`
            }
          }
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

        cssText += `\n@media (${condition}: ${bpValueStr}) {\n  :root {\n${createCssVars(
          bpTokens as Record<string, unknown>,
          [],
          true,
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

  return {
    cssText,
    tokens: semantics as S,
    primitives: primitives as P,
  }
}
