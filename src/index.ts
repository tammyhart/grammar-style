import type { BaseGrammarConfig, ValidatedConfig } from "./types"

/**
 * Defines a grammar context with strongly typed validation for primitives and semantic mappings.
 * All invalid property paths are highlighted exactly at their source without throwing high-level generic warnings.
 */
export function defineGrammar<
  P extends Record<string, any>,
  const C extends BaseGrammarConfig<P>
>(config: C extends ValidatedConfig<P, C> ? C : ValidatedConfig<P, C>): Readonly<C & ValidatedConfig<P, C>> {
  return config as any;
}

export * from "./core"
export { default as token } from "./token"
export * from "./config"
export * from "./defaults"
