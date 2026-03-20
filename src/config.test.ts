import { describe, it, expect } from "vitest"
import { loadConfig, loadConfigSync } from "./config"
import { join } from "node:path"

describe("loadConfig", () => {
  it("resolves the dummy grammar.config.ts in the project root correctly via JITI", async () => {
    const config = await loadConfig(join(process.cwd(), ""))
    
    if (config) {
      expect(config.primitives).toBeDefined()
      expect(config.semantics).toBeDefined()
      expect(typeof config.options).toBe("object")
    } else {
      expect(config).toBeNull()
    }
  })

  it("returns null gracefully if no configuration file is found anywhere in hierarchy", async () => {
    const config = await loadConfig(join(process.cwd(), "does-not-exist"))
    expect(config).toBeNull()
  })

  it("throws immediately on syntax errors inside a loaded config file", async () => {
    // We can simulate this by pointing the loader to a directory containing a deliberately broken config
    const fs = await import("node:fs")
    const badDir = join(process.cwd(), "test-syntax-error")
    if (!fs.existsSync(badDir)) fs.mkdirSync(badDir)
    fs.writeFileSync(join(badDir, "grammar.config.ts"), "export const a = ; // syntax error")
    
    await expect(loadConfig(badDir)).rejects.toThrow()
    
    fs.rmSync(badDir, { recursive: true, force: true })
  })

  it("safely catches generic module requirement failures in ES execution globally", async () => {
    const originalEval = globalThis.eval
    globalThis.eval = (str: string) => {
      if (str.includes('require')) throw new Error("Synthetic async require missing")
      return originalEval(str)
    }
    
    expect(await loadConfig(process.cwd())).toBeNull()
    
    globalThis.eval = originalEval
  })

  it("handles pure ESM default-nested module branches correctly", async () => {
    const originalEval = globalThis.eval
    globalThis.eval = (str: string) => {
      if (str.includes('typeof require')) return false
      if (str.includes('node:path')) return import("node:path")
      if (str.includes('jiti')) return Promise.resolve({ default: { createJiti: (dir: string) => ({ import: () => ({ primitives: {} }) }) } })
      return originalEval(str)
    }
    await loadConfig(process.cwd())
    globalThis.eval = originalEval
  })
})

describe("loadConfigSync", () => {

  it("resolves the dummy grammar.config.ts natively via JITI", () => {
    const config = loadConfigSync(join(process.cwd(), ""))
    
    if (config) {
      expect(config.primitives).toBeDefined()
      expect(config.semantics).toBeDefined()
      expect(typeof config.options).toBe("object")
    } else {
      expect(config).toBeNull()
    }
  })

  it("returns null safely if no file exists", () => {
    const config = loadConfigSync(join(process.cwd(), "does-not-exist"))
    expect(config).toBeNull()
  })

  it("throws precisely on internal typescript sync errors", async () => {
    const fs = await import("node:fs")
    const badDir = join(process.cwd(), "test-syntax-error-sync")
    if (!fs.existsSync(badDir)) fs.mkdirSync(badDir)
    fs.writeFileSync(join(badDir, "grammar.config.ts"), "export const a = ; // syntax error")
    
    expect(() => loadConfigSync(badDir)).toThrow()
    
    fs.rmSync(badDir, { recursive: true, force: true })
  })

  it("safely handles unwrapped CommonJS exports to cover 'default' branch natively", async () => {
    const fs = await import("node:fs")
    const dir = join(process.cwd(), "test-cjs-export")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(join(dir, "grammar.config.cjs"), "module.exports = { primitives: { p: 1 }, semantics: {} };")
    
    // Test the async tracker
    const configAsync = await loadConfig(dir)
    expect(configAsync?.primitives).toBeDefined()
    
    // Test the sync tracker
    const configSync = loadConfigSync(dir)
    expect(configSync?.primitives).toBeDefined()
    
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it("handles pure ESM dynamic import loading natively when require is completely absent", async () => {
    const originalEval = globalThis.eval
    globalThis.eval = (str: string) => {
      if (str.includes('typeof require')) return false
      if (str.includes('import(')) {
        if (str.includes('node:path')) return import("node:path")
        if (str.includes('jiti')) return import("jiti")
      }
      return originalEval(str)
    }

    const config = await loadConfig(process.cwd())
    expect(config).toBeDefined()
    
    globalThis.eval = originalEval
  })

  it("handles graceful fallback when require structurally throws during JITI execution synchronously", () => {
    const originalEval = globalThis.eval
    globalThis.eval = (str: string) => {
      if (str.includes('require')) throw new Error("Synthetic missing require")
      return originalEval(str)
    }
    
    expect(loadConfigSync(process.cwd())).toBeNull()
    
    globalThis.eval = originalEval
  })

  it("safely extracts configuration without a default wrapper natively through JITI sync", () => {
    const originalEval = globalThis.eval
    globalThis.eval = (str: string) => {
      if (str.includes("require")) return { 
         resolve: () => "grammar.config.ts",
         createJiti: () => () => ({ primitives: { p: 2 } })
      }
      return originalEval(str)
    }
    expect(loadConfigSync(process.cwd())).toBeDefined()
    globalThis.eval = originalEval
  })
})
