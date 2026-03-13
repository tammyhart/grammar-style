type ValidSmallSize = 1 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16;

type EvenDigit = '0' | '2' | '4' | '6' | '8';
type OddDigit = '1' | '3' | '5' | '7' | '9';

type NonZero = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

// A prefix for numbers >= 100
type Prefix = '' | NonZero | `${NonZero}${bigint}`;

/**
 * Validizes sizes against the 4pt grid layout constraints.
 */
export type ValidSizeStr = 
  | `${ValidSmallSize}`
  | `${Prefix}${EvenDigit}${ '0' | '4' | '8' }` 
  | `${Prefix}${OddDigit}${ '2' | '6' }`;

const generateSizes = () => {
  const sizes: Record<string, string> = {};

  const smalls: ValidSmallSize[] = [1, 2, 4, 6, 8, 10, 12, 14, 16];
  for (const s of smalls) {
    sizes[s] = `${s / 16}rem`;
  }

  // Support multiples of 4 from 20 to 1000px
  for (let s = 20; s <= 1000; s += 4) {
    sizes[s] = `${s / 16}rem`;
  }

  return sizes as Record<ValidSizeStr, string>;
};

export const defaultSizes = generateSizes();

export const defaultBreakpoints = {
  palm: "37.5rem",
  grip: "50rem",
  lap: "62.5rem",
  desk: "75rem",
  wall: "87.5rem",
} as const

export type DefaultBreakpoints = typeof defaultBreakpoints
export type DefaultSizes = typeof defaultSizes
