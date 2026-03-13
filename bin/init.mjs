#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const targetDir = process.cwd()
  const targetFile = path.join(targetDir, "grammar.config.ts")

  // Check if file already exists
  try {
    await fs.access(targetFile)
    console.log("❌ grammar.config.ts already exists in this directory.")
    process.exit(1)
  } catch (e) {
    // File doesn't exist, this is good
  }

  // The template content
  const template = `import { defineGrammar, defaultSizes, defaultBreakpoints } from "grammar-style"

export default defineGrammar({
  breakpoints: defaultBreakpoints,

  // 1. Define your raw primitive values (e.g., color palettes, base sizing)
  primitives: {
    stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
  },

  // 2. Map primitives to semantic names that you will use in your components
  //    You can use a flat object with dot-notation primitive paths...
  semantics: {
    color: {
      primary: {
        base: "stone.100",
      },
      background: "stone.10",
    },
    // spacing: { base: "1.5rem" } 
    // note: '1.5rem' isn't in primitives so this would error if we strict match.
  },

  // 3. (Optional) Provide mode overrides. E.g. dark mode
  modes: {
    dark: {
      color: {
        primary: {
          base: "stone.10",
        },
        background: "stone.100",
      },
    },
  },
})

// Or use a function to map your semantics directly from the inferred primitive types:
export const genericConfig = defineGrammar({
  primitives: {
    stone: { 100: "#1A1A1A", 50: "#808080", 10: "#E6E6E6" },
  },
  semantics: (p) => ({
    color: {
      primary: {
        base: p.stone[100],
      },
      background: p.stone[10],
    },
  }),
})
`

  // Write the file
  try {
    await fs.writeFile(targetFile, template, "utf-8")
    console.log("✅ Created grammar.config.ts")
    console.log("✨ You are ready to start styling!")
  } catch (error) {
    console.error("❌ Failed to create grammar.config.ts", error)
    process.exit(1)
  }
}

run()
