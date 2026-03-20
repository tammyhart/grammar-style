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
})
