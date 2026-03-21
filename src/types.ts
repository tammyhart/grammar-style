import type {
  DefaultSizes,
  BreakpointName,
  BaseBreakpointName,
  ValidBreakpointValue,
  ValidModeName,
  DefaultOpacities,
  ValidOpacityName,
  ValidSizeStr
} from "./defaults"

export type Primitive = string | number | boolean | null | undefined

export type Leaves<T> =
  T extends Primitive ? ""
  : {
      [K in keyof T]: K extends string | number ?
        T[K] extends Primitive ?
          `${K}`
        : `${K}.${Leaves<T[K]>}`
      : never
    }[keyof T]

export type PathToDots<T> =
  T extends Primitive ? never
  : {
      [K in keyof T & (string | number)]: T[K] extends Primitive ? `${K}`
      : `${K}.${PathToDots<T[K]>}` extends infer S ?
        S extends string ?
          S
        : never
      : never
    }[keyof T & (string | number)]

export type SemanticObject<P> = {
  [key: string]: SemanticObject<P> | PathToDots<P>
}

export type DeepPartialPaths<T, P, Ops extends string | number = ValidOpacityName> =
  T extends object ?
    {
      [K in keyof T]?: DeepPartialPaths<T[K], P, Ops>
    }
  : T extends PathToDots<P> ? PathToDots<P>
  : T extends string ? ValidateString<T, P, false, Ops>
  : T extends number ? number
  : T

export type ValidateOverrides<Input, Shape> =
  Input extends object ?
    {
      [K in keyof Input]: K extends keyof NonNullable<Shape> ?
        Input[K] extends object ?
          ValidateOverrides<Input[K], NonNullable<Shape>[K]>
        : NonNullable<Shape>[K]
      : "Error: This property does not exist in your semantics shape"
    }
  : Shape

export type ValidatePaths<Input, P> = {
  [K in keyof Input]: Input[K] extends string ?
    Input[K] extends PathToDots<P> ?
      Input[K]
    : "Error: Invalid primitive path"
  : Input[K] extends object ? ValidatePaths<Input[K], P>
  : Input[K]
}

export type ReplaceAll<S extends string, From extends string, To extends string> =
  From extends "" ? S
  : S extends `${infer L}${From}${infer R}` ?
    `${L}${To}${ReplaceAll<R, From, To>}`
  : S

export type ReplaceDashes<S extends string> =
  S extends `-${infer Rest}` ?
    `-${ReplaceAll<Rest, "-", ".">}`
  : ReplaceAll<S, "-", ".">

export type DidYouMeanSuffix<
  S extends string,
  P,
  IsPrimitive extends boolean,
  Ops extends string | number,
> =
  ReplaceDashes<S> extends infer Suggested ?
    Suggested extends string ?
      Suggested extends S ?
        ""
      : ValidToken<Suggested, P, IsPrimitive, Ops> extends true ?
        ` Did you mean '${Suggested}'?`
      : ""
    : ""
  : ""

export type DidYouMeanStrictSuffix<S extends string> =
  ReplaceDashes<S> extends infer Suggested ?
    Suggested extends string ?
      Suggested extends S ?
        ""
      : IsStrictToken<Suggested> extends true ?
        ` Did you mean '${Suggested}'?`
      : ""
    : ""
  : ""

export type HasColorValue<S extends string> = S extends `#${string}` ? true
  : S extends `rgb(${string}` ? true
  : S extends `rgba(${string}` ? true
  : S extends `hsl(${string}` ? true
  : S extends `hsla(${string}` ? true
  : false

export type ConfigOps<O extends readonly number[]> = O extends [] ? ValidOpacityName : O[number]

export type ValidToken<S extends string, P, IsPrimitive extends boolean = false, Ops extends string | number = ValidOpacityName> = 
  S extends "" ? true
  : S extends `${string}px${string}` ? `Error: 'px' values are not allowed: '${S}'`
  : S extends PathToDots<P> ? true
  : S extends `-${infer Rest}` ? (
      Rest extends `size.${string}` ? 
        (Rest extends PathToDots<P> ? true : `Error: invalid negative primitive path: '${Rest}'${DidYouMeanSuffix<S, P, IsPrimitive, Ops>}`)
      : `Error: negative values are only allowed for size primitives: '${Rest}'${DidYouMeanSuffix<S, P, IsPrimitive, Ops>}`
    )
  : S extends `${infer Prefix}/${infer _Opacity}` ? (Prefix extends PathToDots<P> ? (_Opacity extends `${Ops}` ? true : `Error: opacity '${_Opacity}' is not allowed in options.opacities`) : `Error: invalid primitive path before opacity: '${Prefix}'${DidYouMeanSuffix<S, P, IsPrimitive, Ops>}`)
  : S extends `blur(${infer Inner})` ? (Inner extends PathToDots<P> ? true : `Error: invalid primitive path inside blur: '${Inner}'${DidYouMeanSuffix<S, P, IsPrimitive, Ops>}`)
  : S extends `${string}.${string}` ? (
      S extends `${"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}${string}` ? true : `Error: invalid token: '${S}'${DidYouMeanSuffix<S, P, IsPrimitive, Ops>}`
    )
  : IsPrimitive extends false ? (HasColorValue<S> extends true ? `Error: literal colors are not allowed outside primitives: '${S}'` : true)
  : true

export type ValidateString<S extends string, P, IsPrimitive extends boolean = false, Ops extends string | number = ValidOpacityName> = string extends S ? S
  : S extends `${infer First}, ${infer Rest}` ? (ValidateString<First, P, IsPrimitive, Ops> extends First ? (ValidateString<Rest, P, IsPrimitive, Ops> extends Rest ? S : ValidateString<Rest, P, IsPrimitive, Ops>) : ValidateString<First, P, IsPrimitive, Ops>)
  : S extends `${infer First},${infer Rest}` ? (ValidateString<First, P, IsPrimitive, Ops> extends First ? (ValidateString<Rest, P, IsPrimitive, Ops> extends Rest ? S : ValidateString<Rest, P, IsPrimitive, Ops>) : ValidateString<First, P, IsPrimitive, Ops>)
  : S extends `${infer First} ${infer Rest}` ? (ValidToken<First, P, IsPrimitive, Ops> extends true ? (ValidateString<Rest, P, IsPrimitive, Ops> extends Rest ? S : ValidateString<Rest, P, IsPrimitive, Ops>) : ValidToken<First, P, IsPrimitive, Ops> extends string ? ValidToken<First, P, IsPrimitive, Ops> : `Error: invalid token: '${First}'`)
  : ValidToken<S, P, IsPrimitive, Ops> extends true ? S
  : ValidToken<S, P, IsPrimitive, Ops> extends string ? ValidToken<S, P, IsPrimitive, Ops>
  : `Error: invalid token: '${S}'`

export type ValidateObject<Input, P, IsPrimitive extends boolean = false, Ops extends string | number = ValidOpacityName> = {
  [K in keyof Input]: Input[K] extends object ? ValidateObject<Input[K], P, IsPrimitive, Ops>
  : Input[K] extends string ? ValidateString<Input[K], P, IsPrimitive, Ops>
  : Input[K] extends number ? number
  : Input[K]
}

export type ValidateRootObject<Input, P, IsPrimitive extends boolean = false, Ops extends string | number = ValidOpacityName, StrictSizes extends boolean = true> = {
  [K in keyof Input]: IsPrimitive extends true 
    ? (K extends "size" ? (StrictSizes extends false ? (Input[K] extends object ? ValidateObject<Input[K], P, IsPrimitive, Ops> : "Error: Tokens must be nested at least one level deep.") : "Error: The 'size' primitive is a built-in constant and cannot be overridden.") : Input[K] extends object ? ValidateObject<Input[K], P, IsPrimitive, Ops> : "Error: Tokens must be nested at least one level deep (e.g., namespace: { key: 'value' }) to generate valid dot paths.")
    : (Input[K] extends object ? ValidateObject<Input[K], P, IsPrimitive, Ops> : "Error: Tokens must be nested at least one level deep (e.g., namespace: { key: 'value' }) to generate valid dot paths.")
}

export type ExpectedShape<Input, P, Ops extends string | number = ValidOpacityName> = {
  [K in keyof Input]: Input[K] extends object ? ExpectedShape<Input[K], P, Ops>
  : Input[K] extends PathToDots<P> ? PathToDots<P>
  : Input[K] extends string ? ValidateString<Input[K], P, false, Ops>
  : Input[K] extends number ? number
  : PathToDots<P>
}

export type ExpectedRootShape<Input, P, Ops extends string | number = ValidOpacityName> = {
  [K in keyof Input]: Input[K] extends object ? ExpectedShape<Input[K], P, Ops>
  : "Error: Tokens must be nested at least one level deep (e.g., namespace: { key: 'value' }) to generate valid dot paths."
}

export type SafeNoInfer<T> = [T][T extends unknown ? 0 : never]

export type DeepPartial<T> =
  T extends object ?
    {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : Primitive

export type CleanPath<T extends string> = T extends `${infer P}.` ? P : T

export interface Register {}

export type GrammarRegistry = Register extends { theme: infer T } ? T : {}

export type GrammarTokens = GrammarRegistry extends { semantics: infer S } ? S : {}
export type GrammarPrimitives = GrammarRegistry extends { primitives: infer P } ? P : {}

export type ResolvesToSize<T, P extends string = ""> = T extends undefined ? never : {
  [K in keyof T]-?: T[K] extends `size.${string}` | `calc(${string}` | `-${string}` ? `${P}${K & string}`
    : T[K] extends object ? ResolvesToSize<T[K], `${P}${K & string}.`> 
    : never
}[keyof T]

type AllTokenPaths = 
  | CleanPath<NonNullable<Leaves<GrammarTokens>>> 
  | CleanPath<NonNullable<Leaves<GrammarPrimitives>>>
  | (ResolvesToSize<GrammarTokens> extends infer R ? R extends string ? `-${R}` : never : never)
  | `size.${ValidSizeStr}`
  | `-size.${ValidSizeStr}`

export type IsStrictToken<S extends string> =
  S extends "" ? true
  : S extends "-" ? true
  : S extends `${string}px${string}` ? `Error: 'px' values are not allowed`
  : S extends AllTokenPaths ? true
  : S extends `-${infer Rest}` ? (
      Rest extends AllTokenPaths ? true 
      : Rest extends `${string}.${string}` ? `Error: invalid negative token: '${Rest}'${DidYouMeanStrictSuffix<S>}` 
      : true
    )
  : S extends `${infer Prefix}/${infer _Ops}` ? (
      Prefix extends AllTokenPaths ? true 
      : Prefix extends `${string}.${string}` ? `Error: invalid token before opacity: '${Prefix}'${DidYouMeanStrictSuffix<S>}` 
      : true
    )
  : S extends `${string}.${string}` ? `Error: invalid token: '${S}'${DidYouMeanStrictSuffix<S>}`
  : true


export type CleanPunctuation<S extends string> =
  S extends `${infer L}(${infer R}` ? CleanPunctuation<`${L} ${R}`>
  : S extends `${infer L})${infer R}` ? CleanPunctuation<`${L} ${R}`>
  : S extends `${infer L},${infer R}` ? CleanPunctuation<`${L} ${R}`>
  : S extends `${infer L}*${infer R}` ? CleanPunctuation<`${L} ${R}`>
  : S extends `${infer L}+${infer R}` ? CleanPunctuation<`${L} ${R}`>
  : S

export type ValidateWords<S extends string> = string extends S ? S
  : S extends `${infer First} ${infer Rest}` ? (
      IsStrictToken<First> extends true ? ValidateWords<Rest> : IsStrictToken<First>
    )
  : IsStrictToken<S>

export type ValidateTokenString<S extends string> = ValidateWords<CleanPunctuation<S>> extends true ? S : ValidateWords<CleanPunctuation<S>> extends string ? ValidateWords<CleanPunctuation<S>> : S

// Force exact match by returning never if the user supplies a key that does not exist in the shape
export type StrictDeepPartial<Shape, Input> =
  Input extends object ?
    {
      [K in keyof Input]: K extends keyof Shape ?
        StrictDeepPartial<Shape[K], Input[K]>
      : never // This `never` forces a type error
    }
  : DeepPartial<Shape>

export interface ThemeConfig<
  P extends Record<string, unknown>,
  S extends Record<string, unknown>,
> {
  options?: {
    content?: readonly string[]
    breakpoints?: Record<string, string>
    modes?: readonly string[]
    opacities?: readonly number[]
    useStrictSizes?: boolean
  }
  primitives?: P
  semantics: S
  modes?: Record<string, DeepPartial<S>>
  responsive?: Record<string, DeepPartial<S>>
}

export interface BaseGrammarConfig<P> {
  options?: {
    content?: readonly string[]
    breakpoints?: Record<string, string>
    modes?: readonly string[]
    opacities?: readonly number[]
    useStrictSizes?: boolean
  }
  primitives?: P
  semantics: object
  modes?: object
  responsive?: object
}

export type ExtractP<C> = C extends { primitives: infer P } ? P : unknown
export type ExtractS<C> = C extends { semantics: infer Sem } ? Sem : unknown
export type ExtractM<C> =
  C extends { modes?: infer M } ?
    M extends undefined ?
      {}
    : M
  : {}
export type ExtractR<C> =
  C extends { responsive?: infer R } ?
    R extends undefined ?
      {}
    : R
  : {}

export type ExtractModeOptions<C> =
  C extends { options?: { modes?: infer M } } ?
    M extends ReadonlyArray<string> ?
      M[number]
    : never
  : never

export type HasCustomModes<C> =
  string extends ExtractModeOptions<C> ? false :
  [ExtractModeOptions<C>] extends [never] ? false : true

export type AllowedModes<C> =
  HasCustomModes<C> extends true ? ExtractModeOptions<C> : ValidModeName

export type ExtractO<C> =
  C extends { options?: { opacities?: infer O } } ?
    O extends ReadonlyArray<number> ?
      O[number]
    : never
  : never

export type CustomOpacityKeys<C> = ExtractO<C>
export type HasCustomOpacities<C> =
  number extends CustomOpacityKeys<C> ? false :
  [CustomOpacityKeys<C>] extends [never] ? false : true
export type HasOnlyDefaultOpacityOverrides<C> =
  Exclude<CustomOpacityKeys<C>, keyof DefaultOpacities> extends never ? true
  : false

export type AllowedOpacities<C> =
  HasCustomOpacities<C> extends true ?
    HasOnlyDefaultOpacityOverrides<C> extends true ?
      keyof DefaultOpacities
    : CustomOpacityKeys<C>
  : keyof DefaultOpacities

export type ValidateModes<M, S, P, C> = {
  [K in keyof M]: K extends AllowedModes<C> ?
    ValidateOverrides<M[K], DeepPartialPaths<SafeNoInfer<S>, P, AllowedOpacities<C> & (string | number)>>
  : "Error: Mode name must be a valid default mode ('dark', 'light') or defined in options.modes"
}

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type IsValidOpacityWhole<T extends string> =
  T extends "100" ? true
  : T extends `${Digit}${Digit}${Digit}${string}` ? false
  : true

export type ValidateOpacityValue<T extends number> =
  `${T}` extends `-${string}` ? "Error: Opacity cannot be less than 0"
  : `${T}` extends `${infer Whole}.${string}` ?
    IsValidOpacityWhole<Whole> extends true ?
      T
    : "Error: Opacity must be <= 100"
  : IsValidOpacityWhole<`${T}`> extends true ? T
  : "Error: Opacity must be <= 100"

export type ValidateOpacitiesArray<O extends readonly any[]> = {
  readonly [K in keyof O]: O[K] extends number ? ValidateOpacityValue<O[K]>
  : O[K]
}

export type ExtractRawO<C> =
  C extends { options?: { opacities?: infer O } } ? O : undefined

export type CorePrimitives = {
  size: DefaultSizes
}

export type ValidateBreakpoints<B> = {
  [K in keyof B]: K extends `${string}Max` ?
    "Error: Max breakpoints are auto-generated. Please define base names only."
  : B[K] extends ValidBreakpointValue ? B[K]
  : | ValidBreakpointValue
    | "Error: Breakpoint values must be a valid size dot-path (e.g. 'size.100') or a rem value (e.g. '40rem')"
}

export type ExtractB<C> =
  C extends { options?: { breakpoints?: infer B } } ?
    B extends undefined ?
      {}
    : B
  : {}

export type CustomKeys<C> = keyof ExtractB<C> & string
export type HasCustomBreakpoints<C> = string extends CustomKeys<C> ? false : CustomKeys<C> extends never ? false : true
export type HasOnlyDefaultOverrides<C> =
  Exclude<CustomKeys<C>, BaseBreakpointName> extends never ? true : false

export type AllowedBaseBreakpoints<C> =
  HasCustomBreakpoints<C> extends true ?
    HasOnlyDefaultOverrides<C> extends true ?
      BaseBreakpointName
    : CustomKeys<C>
  : BaseBreakpointName

export type AllowedBreakpoints<C> =
  | AllowedBaseBreakpoints<C>
  | `${AllowedBaseBreakpoints<C>}Max`

export type ValidateResponsive<R, S, P, C> = {
  [K in keyof R]: K extends AllowedBreakpoints<C> ?
    ValidateOverrides<R[K], DeepPartialPaths<SafeNoInfer<S>, P, AllowedOpacities<C> & (string | number)>>
  : "Error: Responsive key must be a valid base breakpoint name (or its 'Max' equivalent)."
}

export type ExtractStrictSizes<C> = 
  C extends { options?: { useStrictSizes?: infer S } } ? 
    (S extends false ? false : true) 
  : true;

export type ValidatedConfig<
  P,
  C,
  O extends readonly number[] = C extends (
    { options?: { opacities?: infer Ops extends readonly number[] } }
  ) ?
    Ops
  : [],
> = {
  options?: {
    content?: readonly string[]
    breakpoints?: ValidateBreakpoints<ExtractB<C>>
    modes?: readonly string[]
    opacities?: ValidateOpacitiesArray<O>
    useStrictSizes?: ExtractStrictSizes<C> extends false ? false : boolean
  }
  primitives?: ValidateRootObject<P, P & CorePrimitives, true, AllowedOpacities<C> & (string | number), ExtractStrictSizes<C>>
  semantics: ExpectedRootShape<ExtractS<C>, P & CorePrimitives, AllowedOpacities<C> & (string | number)>
  modes?: ValidateModes<ExtractM<C>, ExtractS<C>, P & CorePrimitives, C>
  responsive?: ValidateResponsive<
    ExtractR<C>,
    ExtractS<C>,
    P & CorePrimitives,
    C
  >
}

export type TokenPath<Prefix extends string = ""> = 
  Prefix extends "" ? AllTokenPaths : 
  | Extract<AllTokenPaths, `${Prefix}.${string}` | Prefix> 
  | `${Extract<AllTokenPaths, `${Prefix}.${string}` | Prefix>}/${AllowedOpacities<GrammarRegistry> & (string | number)}`


