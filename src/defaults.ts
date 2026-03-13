type ValidSmallSize = 1 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16

type EvenDigit = "0" | "2" | "4" | "6" | "8"
type OddDigit = "1" | "3" | "5" | "7" | "9"

type NonZero = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

// A prefix for numbers >= 100
type Prefix = "" | NonZero | `${NonZero}${bigint}`

/**
 * Validizes sizes against the 4pt grid layout constraints.
 */
export type ValidSizeStr =
  | `${ValidSmallSize}`
  | `${Prefix}${EvenDigit}${"0" | "4" | "8"}`
  | `${Prefix}${OddDigit}${"2" | "6"}`

const generateSizes = () => {
  const sizes: Record<string, string> = {}

  const smalls: ValidSmallSize[] = [1, 2, 4, 6, 8, 10, 12, 14, 16]
  for (const s of smalls) {
    sizes[s] = `${s / 16}rem`
  }

  // Support multiples of 4 from 20 to 3000px
  for (let s = 20; s <= 3000; s += 4) {
    sizes[s] = `${s / 16}rem`
  }

  return sizes as Record<ValidSizeStr, string>
}

export const defaultSizes = generateSizes()

export const baseBreakpoints = {
  palm: "size.600",
  grip: "size.800",
  lap: "size.1000",
  desk: "size.1200",
  wall: "size.1400",
} as const

export type BaseBreakpointName = keyof typeof baseBreakpoints
export type BreakpointName = BaseBreakpointName | `${BaseBreakpointName}Max`

export type ValidBreakpointValue =
  | `size.${ValidSizeStr}`
  | `size.${ValidSizeStr} - size.1`
  | `${number}rem`

const generateBreakpoints = () => {
  const bps: Record<string, string> = { ...baseBreakpoints }
  
  for (const [key, value] of Object.entries(baseBreakpoints)) {
    if (value.startsWith("size.")) {
      bps[`${key}Max`] = `${value} - size.1`
    } else if (value.endsWith("rem")) {
      const num = parseFloat(value)
      bps[`${key}Max`] = `${num - 0.0625}rem`
    }
  }
  
  return bps as Record<BreakpointName, ValidBreakpointValue>
}

export const defaultBreakpoints = generateBreakpoints()

export type DefaultBreakpoints = typeof defaultBreakpoints
export type DefaultSizes = typeof defaultSizes
