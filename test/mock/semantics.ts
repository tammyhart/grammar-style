import primitives from "./primitives"

const size = {
  1: "0.0625rem",
  2: "0.125rem",
  4: "0.25rem",
  8: "0.5rem",
  10: "0.625rem",
  12: "0.75rem",
  14: "0.875rem",
  16: "1rem",
  20: "1.25rem",
  24: "1.5rem",
  28: "1.75rem",
  32: "2rem",
  36: "2.25rem",
  40: "2.5rem",
  48: "3rem",
  52: "3.25rem",
  56: "3.5rem",
  60: "3.75rem",
  64: "4rem",
  72: "4.5rem",
  76: "4.75rem",
  80: "5rem",
  88: "5.5rem",
  96: "6rem",
  104: "6.5rem",
  112: "7rem",
  120: "7.5rem",
  128: "8rem",
  136: "8.5rem",
  144: "9rem",
  152: "9.5rem",
  160: "10rem",
  168: "10.5rem",
  176: "11rem",
  192: "12rem",
  200: "12.5rem",
  216: "13.5rem",
  240: "15rem",
  280: "17.5rem",
}

const common = {
  font: {
    xs: size[10],
    sm: size[12],
    md: size[14],
    lg: size[16],
    xl: size[20],
    "2x": size[24],
    "3x": size[32],
  },
  effects: {
    transition: "0.2s ease",
    blur: "blur(0.5rem)",
  },
  icon: {
    xs: size[12],
    sm: size[16],
    md: size[20],
    lg: size[24],
    xl: size[32],
  },
  line: {
    100: 1,
    125: 1.25,
    150: 1.5,
    175: 1.75,
  },
  radius: {
    xs: size[2],
    sm: size[4],
    md: size[8],
    lg: size[16],
  },
  size,
  spacing: {
    base: size[24],
    half: size[12],
    double: size[48],
  },
  weight: {
    200: 200,
    300: 300,
    400: 400,
    600: 600,
  },
}

const primary = {
  base: primitives.motif.rhyme[100],
  heavy: primitives.motif.rhyme[75],
  medium: primitives.motif.rhyme[50],
  light: primitives.motif.rhyme[25],
  faint: primitives.motif.rhyme[10],
  none: primitives.motif.rhyme[0],
}

const light = {
  primary,
  secondary: {
    base: primitives.motif.melody.light[100],
    heavy: primitives.motif.melody.light[75],
    medium: primitives.motif.melody.light[50],
    light: primitives.motif.melody.light[25],
    faint: primitives.motif.melody.light[10],
  },
  background: {
    base: primitives.notation.page[100],
    heavy: primitives.notation.page[75],
    medium: primitives.notation.page[50],
    light: primitives.notation.page[25],
    faint: primitives.notation.page[10],
  },
  foreground: {
    base: primitives.notation.ink[100],
    heavy: primitives.notation.ink[75],
    medium: primitives.notation.ink[50],
    light: primitives.notation.ink[25],
    faint: primitives.notation.ink[10],
  },
  error: {
    base: primitives.tone.friction.light[100],
    heavy: primitives.tone.friction.light[75],
    medium: primitives.tone.friction.light[50],
    light: primitives.tone.friction.light[25],
    faint: primitives.tone.friction.light[10],
  },
  warning: {
    base: primitives.tone.tension.light[100],
    heavy: primitives.tone.tension.light[75],
    medium: primitives.tone.tension.light[50],
    light: primitives.tone.tension.light[25],
    faint: primitives.tone.tension.light[10],
  },
  success: {
    base: primitives.tone.harmony.light[100],
    heavy: primitives.tone.harmony.light[75],
    medium: primitives.tone.harmony.light[50],
    light: primitives.tone.harmony.light[25],
    faint: primitives.tone.harmony.light[10],
  },
  info: {
    base: primitives.tone.unison.light[100],
    heavy: primitives.tone.unison.light[75],
    medium: primitives.tone.unison.light[50],
    light: primitives.tone.unison.light[25],
    faint: primitives.tone.unison.light[10],
  },
}

const dark = {
  primary,
  secondary: {
    base: primitives.motif.melody.dark[100],
    heavy: primitives.motif.melody.dark[75],
    medium: primitives.motif.melody.dark[50],
    light: primitives.motif.melody.dark[25],
    faint: primitives.motif.melody.dark[10],
  },
  error: {
    base: primitives.tone.friction.dark[100],
    heavy: primitives.tone.friction.dark[75],
    medium: primitives.tone.friction.dark[50],
    light: primitives.tone.friction.dark[25],
    faint: primitives.tone.friction.dark[10],
  },
  info: {
    base: primitives.tone.unison.dark[100],
    heavy: primitives.tone.unison.dark[75],
    medium: primitives.tone.unison.dark[50],
    light: primitives.tone.unison.dark[25],
    faint: primitives.tone.unison.dark[10],
  },
  success: {
    base: primitives.tone.harmony.dark[100],
    heavy: primitives.tone.harmony.dark[75],
    medium: primitives.tone.harmony.dark[50],
    light: primitives.tone.harmony.dark[25],
    faint: primitives.tone.harmony.dark[10],
  },
  warning: {
    base: primitives.tone.tension.dark[100],
    heavy: primitives.tone.tension.dark[75],
    medium: primitives.tone.tension.dark[50],
    light: primitives.tone.tension.dark[25],
    faint: primitives.tone.tension.dark[10],
  },
  background: {
    base: primitives.notation.ink[100],
    heavy: primitives.notation.ink[75],
    medium: primitives.notation.ink[50],
    light: primitives.notation.ink[25],
    faint: primitives.notation.ink[10],
  },
  foreground: {
    base: primitives.notation.page[100],
    heavy: primitives.notation.page[75],
    medium: primitives.notation.page[50],
    light: primitives.notation.page[25],
    faint: primitives.notation.page[10],
  },
}

const lap = {
  spacing: {
    base: size[32],
    half: size[16],
    double: size[64],
  },
  font: {
    xs: size[12],
    sm: size[14],
    md: size[16],
    lg: size[20],
    xl: size[24],
    "2x": size[32],
    "3x": size[40],
  },
}

const wall = {
  spacing: {
    base: size[40],
    half: size[20],
    double: size[80],
  },
}

export { common, dark, lap, light, wall }
