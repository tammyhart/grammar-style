import type { BaseGrammarConfig, ValidatedConfig } from "./types"

/**
 * Defines a grammar context with strongly typed validation for primitives and semantic mappings.
 * All invalid property paths are highlighted exactly at their source without throwing high-level generic warnings.
 */
export function defineGrammar<
  P extends Record<string, unknown>,
  const C extends BaseGrammarConfig<P>
>(config: C extends ValidatedConfig<P, C> ? C : ValidatedConfig<P, C>): Readonly<C & ValidatedConfig<P, C>> {
  return config as unknown as Readonly<C & ValidatedConfig<P, C>>;
}

export { createTheme } from "./core"
export { default as token } from "./token"
export { loadConfig } from "./config"

// Expose defaults directly for manual user reference if needed
export { defaultBreakpoints, defaultSizes } from "./defaults"

// Expose helpful utility types for external typed setups
export type { ThemeConfig, TokenPath, DeepPartial } from "./types"
export type { ValidSizeStr, BreakpointName } from "./defaults"
