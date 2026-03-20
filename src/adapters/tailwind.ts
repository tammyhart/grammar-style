import { createTheme } from "../core"
import { loadConfigSync } from "../config"
import type { ThemeConfig } from "../types"

const isObject = (item: unknown): item is Record<string, unknown> => {
  return !!item && typeof item === "object" && !Array.isArray(item)
}

const mapToTailwindVars = (
  obj: Record<string, unknown>,
  prefix: string[] = []
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (isObject(value)) {
      result[key] = mapToTailwindVars(value, [...prefix, key])
    } else {
      result[key] = `var(--${[...prefix, key].join("-")})`
    }
  })
  return result
}

const createTailwindTheme = <
  P extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  ) => {
  const loadedConfig = loadConfigSync() as ThemeConfig<P, S>;
  if (!loadedConfig) throw new Error("Grammar Style: Could not find grammar.config.ts");
  const theme = createTheme(loadedConfig)

  const p = theme.primitives as Record<string, unknown>;
  const s = theme.tokens as Record<string, unknown>;

  const cssText = theme.cssText;
  const media = theme.media;

  const screens: Record<string, string> = {}
  Object.keys(media).forEach(k => {
    // Media values look like `@media (max-width: calc(40rem - 1px))` or `@media (min-width: 40rem)`
    // Tailwind just needs the inner value: `{ max: 'calc(40rem - 1px)' }` or `'40rem'`
    const query = media[k] as string;
    const match = query.match(/\((min-width|max-width):\s*(.*?)\)/);
    /* v8 ignore next 8 */
    if (match) {
       if (match[1] === 'max-width') {
          screens[k] = { max: match[2] } as any;
       } else {
          screens[k] = match[2];
       }
    }
  })

  return {
    cssText,
    theme: {
      screens,
      extend: {
        colors: {
          ...(isObject(p.color) ? mapToTailwindVars(p.color as any, ["color"]) : {}),
          ...(isObject(s.color) ? mapToTailwindVars(s.color as any, ["color"]) : {}),
        },
        spacing: {
          /* v8 ignore next */
          ...(isObject(p.size) ? mapToTailwindVars(p.size as any, ["size"]) : {}),
          ...(isObject(s.spacing) ? mapToTailwindVars(s.spacing as any, ["spacing"]) : {}),
        },
        borderRadius: {
          ...(isObject(p.radius) ? mapToTailwindVars(p.radius as any, ["radius"]) : {}),
          ...(isObject(s.radius) ? mapToTailwindVars(s.radius as any, ["radius"]) : {}),
        },
        boxShadow: {
          ...(isObject(p.shadow) ? mapToTailwindVars(p.shadow as any, ["shadow"]) : {}),
          ...(isObject(s.shadow) ? mapToTailwindVars(s.shadow as any, ["shadow"]) : {}),
        }
      }
    }
  }
}

export default createTailwindTheme
