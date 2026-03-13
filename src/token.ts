import type { TokenPath } from "./types"

const token = (path: TokenPath): string => {
  if (!path) return ""

  // We simply convert the object path (color.primary.base) to CSS var (--color-primary-base)
  const variable = (path as string).replace(/\./g, "-")

  return `var(--${variable})`
}

export default token
