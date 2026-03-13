import { defineGrammar } from "./src"

export default defineGrammar({
  options: {
    breakpoints: {
      palm: "size.500",
      lap: "size.1000",
    },
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
  },

  // 2. Semantics as a flat object parsing string dot-paths.
  //    Try changing "size.192" to "size.193" to test type catching.
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
        accent: "color.semantic",
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
    spacing: "size.24",
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

  responsive: {
    lap: {
      spacing: "size.32",
    },
  },
})
