import { common, dark, lap, light, wall } from "./semantics"

// Common tokens shared between light and dark themes
const toKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()

const toCssVar = (path: string[]) => `--${path.map(toKebab).join("-")}`

const createCssVars = (
  obj: Record<string, unknown>,
  prefix: string[] = [],
): string => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPath = key === "base" ? prefix : [...prefix, key]
    if (typeof value === "object" && value !== null) {
      return acc + createCssVars(value as Record<string, unknown>, newPath)
    }

    // Strip 'effects' from the path
    const finalPath = newPath.filter(p => p !== "effects")
    return acc + `${toCssVar(finalPath)}: ${value};\n`
  }, "")
}

const cssVars = {
  common: createCssVars(common),
  lap: createCssVars(lap),
  wall: createCssVars(wall),
  dark: createCssVars(dark, ["color"]),
  light: createCssVars(light, ["color"]),
}

export { cssVars }
