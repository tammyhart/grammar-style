import type {
  ExpectedShape,
  DeepPartialPaths,
  SafeNoInfer,
  ValidateOverrides,
  Primitive,
  TokenPath
} from "./types"

export interface BaseGrammarConfig<P> {
  options?: object;
  primitives?: P;
  semantics: object;
  modes?: object;
  responsive?: object;
}

export type ExtractP<C> = C extends { primitives: infer P } ? P : any;
export type ExtractS<C> = C extends { semantics: infer Sem } ? Sem : any;
export type ExtractM<C> = C extends { modes?: infer M }
  ? M extends undefined
    ? {}
    : M
  : {};
export type ExtractR<C> = C extends { responsive?: infer R }
  ? R extends undefined
    ? {}
    : R
  : {};

export type ValidateModes<M, S, P> = {
  [K in keyof M]: K extends string
    ? ValidateOverrides<M[K], DeepPartialPaths<SafeNoInfer<S>, P>>
    : never;
};

import type { DefaultSizes, BreakpointName, BaseBreakpointName, ValidBreakpointValue } from "./defaults";

export type CorePrimitives = {
  size: DefaultSizes;
};

export type ValidateResponsive<R, S, P> = {
  [K in keyof R]: K extends BreakpointName
    ? ValidateOverrides<R[K], DeepPartialPaths<SafeNoInfer<S>, P>>
    : "Error: Responsive keys must be valid breakpoint names (e.g. palm, grip)";
};

export type ValidateBreakpoints<B> = {
  [K in keyof B]: K extends BaseBreakpointName
    ? B[K] extends ValidBreakpointValue
      ? B[K]
      : ValidBreakpointValue | "Error: Breakpoint values must be a valid size dot-path (e.g. 'size.100') or a rem value (e.g. '40rem')"
    : "Error: Breakpoint must be a valid base name (e.g. palm, grip, lap, desk, wall). Max breakpoints are auto-generated.";
};

export type ExtractB<C> = C extends { options?: { breakpoints?: infer B } }
  ? B extends undefined
    ? {}
    : B
  : {};

export type ValidatedConfig<P, C> = {
  options?: {
    breakpoints?: ValidateBreakpoints<ExtractB<C>>;
  };
  primitives?: P;
  semantics: ExpectedShape<ExtractS<C>, P & CorePrimitives>;
  modes?: ValidateModes<ExtractM<C>, ExtractS<C>, P & CorePrimitives>;
  responsive?: ValidateResponsive<ExtractR<C>, ExtractS<C>, P & CorePrimitives>;
};

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
