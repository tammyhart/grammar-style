import { defineGrammar, defaultSizes } from "./src"

export default defineGrammar({
  // 1. Define your raw primitive values
  primitives: {
    color: {
      stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
    },
    // We import the pre-computed 4pt layout sizing scale (from 1 to 1000px natively formatted)
    size: defaultSizes,
  },

  // 2. Semantics as a flat object parsing string dot-paths.
  //    Try changing "size.192" to "size.193" to test type catching.
  semantics: {
    color: {
      primary: {
        base: "color.stone.100",
      },
      background: "color.stone.10",
    },
    spacing: "size.24",
    layout: {
      hero: "size.192"
    }
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
      spacing: "size.16",
    },
  },
})
