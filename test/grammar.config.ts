import { defineGrammar } from "../src"

export default defineGrammar({
  options: {
    breakpoints: {
      palm: "size.500",
      lap: "size.1000",
      desk: "size.1400",
    },
    opacities: [5, 10, 33, 66, 100],
  },

  // 1. Define your raw primitive values
  primitives: {
    color: {
      syntax: {
        900: "#0D1526",
        800: "#162033",
        500: "#52637A",
        300: "#8A9CB3",
        100: "#D1D9E6",
        50: "#F0F4F8",
      },
      literal: "#FFFFFF",
      semantic: "#FF5500",
      validation: "#10B981",
      drift: "#FBBF24",
      illegal: "#EF4444",
      spec: "#3B82F6",
    },
    shadow: {
      xs: "0 size.1 size.2 0 color.syntax.900/5",
      sm: "0 size.4 size.6 -size.1 color.syntax.900/10, 0 size.2 size.4 -size.1 color.syntax.900/66",
      md: "0 size.10 size.16 -size.24 color.syntax.900/10, 0 size.6 size.10 -size.24 color.syntax.900/66",
      lg: "0 size.20 size.32 -size.48 color.syntax.900/10, 0 size.10 size.20 -size.48 color.syntax.900/66",
    },
  },

  // 2. Semantics as a flat object parsing string dot-paths
  semantics: {
    color: {
      surface: {
        base: "color.syntax.900",
        elevated: "color.syntax.800",
        inset: "color.syntax.100",
      },
      border: {
        subtle: "color.syntax.500",
        strong: "color.syntax.300",
      },
      text: {
        primary: "color.literal",
        secondary: "color.syntax.100",
        muted: "color.syntax.500",
        accent: "color.semantic/33",
      },
      action: {
        primary: "color.semantic",
      },
      status: {
        success: "color.validation",
        warning: "color.drift",
        error: "color.illegal",
        info: "color.spec",
      },
    },
    spacing: {
      base: "size.24",
      half: "size.12",
      double: "size.48",
    },
    shadow: {
      hover: "shadow.xs",
      card: "shadow.sm",
      nav: "shadow.md",
      modal: "shadow.lg",
    },

    effect: {
      blur: "blur(size.16)",
    },
  },

  // 3. Optional mode overrides
  modes: {
    light: {
      color: {
        surface: {
          base: "color.syntax.50",
          elevated: "color.literal",
        },
        border: {
          subtle: "color.syntax.100",
        },
        text: {
          primary: "color.syntax.900",
          secondary: "color.syntax.800",
          muted: "color.syntax.500",
        },
      },
    },
  },

  // 4. Optional responsive overrides
  responsive: {
    palmMax: {
      spacing: {
        base: "size.16",
        half: "size.8",
        double: "size.32",
      },
    },
    lap: {
      spacing: {
        base: "size.40",
        half: "size.20",
        double: "size.80",
      },
    },
  },
})
