import { loadConfig, createTheme, type ThemeConfig } from "../index"

interface ViteServer {
  watcher: {
    on: (event: string, callback: (file: string) => void) => void
  }
  moduleGraph: {
    getModuleById: (id: string) => unknown
    invalidateModule: (mod: unknown) => void
  }
}

interface VitePlugin {
  name: string
  configureServer?: (server: ViteServer) => void
  resolveId?: (id: string) => string | undefined
  load?: (id: string) => Promise<string | undefined> | string | undefined
}

const grammarStyleVitePlugin = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>,
>(
  customConfig?: ThemeConfig<P, S>,
): VitePlugin => {
  const virtualModuleId = "virtual:grammar-style.css"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  return {
    name: "vite-plugin-grammar-style",

    configureServer(server: ViteServer) {
      server.watcher.on("change", (file: string) => {
        if (file.includes("grammar.config")) {
          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          if (mod !== undefined) {
            server.moduleGraph.invalidateModule(mod)
          }
        }
      })
    },

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return undefined
    },

    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        if (customConfig !== undefined) {
          const theme = createTheme(customConfig)
          return theme.cssText
        }

        const cwd = process.cwd()
        const config = await loadConfig(cwd)

        if (config === null) {
          throw new Error(
            "[grammar-style/vite] Could not find grammar.config.ts",
          )
        }

        const theme = createTheme(
          config as unknown as ThemeConfig<
            Record<string, unknown>,
            Record<string, unknown>
          >,
        )
        return theme.cssText
      }
      return undefined
    },
  }
}

export default grammarStyleVitePlugin
