import type {
  ExpectedShape,
  DeepPartialPaths,
  SafeNoInfer,
  ValidateOverrides,
  Primitive,
  TokenPath,
  PathBuilder
} from "./types"

export interface BaseGrammarConfig<P> {
  primitives?: P;
  semantics: object | ((primitives: PathBuilder<P>) => object);
  modes?: object | ((primitives: PathBuilder<P>, semantics: any) => object);
  responsive?: object | ((primitives: PathBuilder<P>, semantics: any) => object);
}

export type ExtractP<C> = C extends { primitives: infer P } ? P : any;
export type ExtractS<C> = C extends { semantics: infer Sem }
  ? Sem extends (...args: any[]) => infer R
    ? R
    : Sem
  : any;
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

export type ValidateModes<M, S, P> = M extends (...args: any[]) => infer R
  ? (
      primitives: P,
      semantics: SafeNoInfer<S>
    ) => {
      [K in keyof R]: K extends string
        ? ValidateOverrides<R[K], DeepPartialPaths<SafeNoInfer<S>, P>>
        : never;
    }
  : {
      [K in keyof M]: K extends string
        ? ValidateOverrides<M[K], DeepPartialPaths<SafeNoInfer<S>, P>>
        : never;
    };

export type ValidatedConfig<P, C> = {
  primitives?: P;
  semantics: C extends { semantics: infer Sem }
    ? Sem extends (...args: any[]) => any
      ? (primitives: P) => ExpectedShape<ExtractS<C>, P>
      : ExpectedShape<ExtractS<C>, P>
    : never;
  modes?: ValidateModes<ExtractM<C>, ExtractS<C>, P>;
  responsive?: ValidateModes<ExtractR<C>, ExtractS<C>, P>;
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
