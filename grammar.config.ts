import { defineGrammar } from "./src"

export default defineGrammar({
  // 1. Define your raw primitive values
  primitives: {
    stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
  },

  // 2. Semantics as a flat object parsing string dot-paths.
  //    Try changing "stone.100" to "stone.99" to test type catching.
  semantics: {
    color: {
      primary:  {
        base: "stone.100",
      },
      background: "stone.10",
    },
    // spacing: { base: "1.5rem" }
    // note: '1.5rem' isn't in primitives so this would error if we strict match.
  },

  // 3. Optional mode overrides
  modes: {
    dark: {
      color: {
        primary:  {
          base: "stone.10",
        },
        background: "stone.100",
      },
    },
  },
})

export const genericConfig = defineGrammar({
  primitives: {
    stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
  },
  semantics: p => ({
    color: {
      primary:  {
        base: p.stone[100],
      },
      background: p.stone[10],
    },
  }),
})
