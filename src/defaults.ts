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

export const generateSizes = () => {
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
  sm: "size.640",
  md: "size.768",
  lg: "size.1024",
  xl: "size.1280",
  xxl: "size.1536",
} as const

export type BaseBreakpointName = keyof typeof baseBreakpoints
export type BreakpointName = BaseBreakpointName | `${BaseBreakpointName}Max`

export type ValidBreakpointValue =
  | `size.${ValidSizeStr}`
  | `calc(size.${ValidSizeStr} - 1px)`
  | `${number}rem`
  | `calc(${number}rem - 1px)`

/* v8 ignore next 3 */
const generateBreakpoints = (
  bpsToParse?: Record<string, string>
): Record<BreakpointName, ValidBreakpointValue> => {
  const safeBpsToParse = bpsToParse || baseBreakpoints
  const bps: Record<string, string> = { ...safeBpsToParse }
  
  for (const [key, value] of Object.entries(safeBpsToParse)) {
    if (String(value).startsWith("size.")) {
      bps[`${key}Max`] = `calc(${value} - 1px)`
    } else if (String(value).endsWith("rem")) {
      bps[`${key}Max`] = `calc(${value} - 1px)`
    }
  }
  
  return bps as Record<BreakpointName, ValidBreakpointValue>
}

export { generateBreakpoints }

export const defaultBreakpoints = generateBreakpoints()

export type DefaultBreakpoints = typeof defaultBreakpoints
export type DefaultSizes = typeof defaultSizes

export const defaultModes = ["dark", "light"] as const
export type ValidModeName = typeof defaultModes[number]

export const defaultOpacities = {
  10: 0.1,
  20: 0.2,
  40: 0.4,
  60: 0.6,
  80: 0.8,
  100: 1,
} as const;

export type DefaultOpacities = typeof defaultOpacities;
export type ValidOpacityName = keyof DefaultOpacities | (string | number);
