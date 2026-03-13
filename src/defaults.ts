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

export const defaultBreakpoints = {
  palm: "size.600",
  palmMax: "size.600 - size.1",
  grip: "size.800",
  gripMax: "size.800 - size.1",
  lap: "size.1000",
  lapMax: "size.1000 - size.1",
  desk: "size.1200",
  deskMax: "size.1200 - size.1",
  wall: "size.1400",
  wallMax: "size.1400 - size.1",
} as const

export type BreakpointName = keyof typeof defaultBreakpoints
export type ValidBreakpointValue =
  | `size.${ValidSizeStr}`
  | `size.${ValidSizeStr} - size.1`
  | `${number}rem`

export type DefaultBreakpoints = typeof defaultBreakpoints
export type DefaultSizes = typeof defaultSizes
