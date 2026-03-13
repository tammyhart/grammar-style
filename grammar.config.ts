import { defineGrammar } from "./src"

export default defineGrammar({
  // 1. Define your raw primitive values
  primitives: {
    color: {
      stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
    },
    spacing: {
      16: "1rem",
      24: "1.5rem",
    },
  },

  // 2. Semantics as a flat object parsing string dot-paths.
  //    Try changing "color.stone.100" to "color.stone.99" to test type catching.
  semantics: {
    color: {
      primary: {
        base: "color.stone.100",
      },
      background: "color.stone.10",
    },
    spacing: "spacing.24",
  },

  // 3. Optional mode overrides
  modes: {
    dark: {
      color: {
        primary: {
          base: "color.stone.10",
        },
        background: "color.stone.100",
      },
    },
  },

  responsive: {
    lap: {
      spacing: "spacing.16",
    },
  },
})
