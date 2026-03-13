export type Primitive = string | number | boolean | null | undefined;

export type Leaves<T> = T extends Primitive
  ? ""
  : {
      [K in keyof T]: K extends string | number
        ? T[K] extends Primitive
          ? `${K}`
          : `${K}.${Leaves<T[K]>}`
        : never
    }[keyof T]

export type PathToDots<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & (string | number)]: T[K] extends Primitive
        ? `${K}`
        : `${K}.${PathToDots<T[K]>}` extends infer S
          ? S extends string
            ? S
            : never
          : never;
    }[keyof T & (string | number)];

export type SemanticObject<P> = {
  [key: string]: SemanticObject<P> | PathToDots<P>;
};

export type DeepPartialPaths<T, P> = T extends object
  ? {
      [K in keyof T]?: DeepPartialPaths<T[K], P>;
    }
  : T extends string
    ? PathToDots<P>
    : T;

export type ValidateOverrides<Input, Shape> = Input extends object
  ? {
      [K in keyof Input]: K extends keyof NonNullable<Shape>
        ? Input[K] extends object
          ? ValidateOverrides<Input[K], NonNullable<Shape>[K]>
          : NonNullable<Shape>[K]
        : "Error: This property does not exist in your semantics shape";
    }
  : Shape;

export type ValidatePaths<Input, P> = {
  [K in keyof Input]: Input[K] extends string
    ? Input[K] extends PathToDots<P>
      ? Input[K]
      : "Error: Invalid primitive path"
    : Input[K] extends object
      ? ValidatePaths<Input[K], P>
      : Input[K];
};

export type ExpectedShape<Input, P> = {
  [K in keyof Input]: Input[K] extends object
    ? ExpectedShape<Input[K], P>
    : PathToDots<P>
};

export type SafeNoInfer<T> = [T][T extends unknown ? 0 : never];

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : Primitive



export type CleanPath<T extends string> = T extends `${infer P}.` ? P : T

export interface Register {}

export type GrammarRegistry = Register extends { theme: infer T } ? T : {}

export type TokenPath = CleanPath<Leaves<GrammarRegistry>>

// Force exact match by returning never if the user supplies a key that does not exist in the shape
export type StrictDeepPartial<Shape, Input> = Input extends object
  ? {
      [K in keyof Input]: K extends keyof Shape
        ? StrictDeepPartial<Shape[K], Input[K]>
        : never // This `never` forces a type error
    }
  : DeepPartial<Shape>

import type { DefaultSizes, BreakpointName, BaseBreakpointName, ValidBreakpointValue, ValidModeName } from "./defaults"

export interface ThemeConfig<
  P extends Record<string, unknown>,
  S extends Record<string, unknown>,
> {
  options?: {
    content?: string[];
    breakpoints?: Record<string, string>;
    modes?: string[];
  };
  primitives?: P;
  semantics: S;
  modes?: Record<string, DeepPartial<S>>;
  responsive?: Record<string, DeepPartial<S>>;
}

export interface BaseGrammarConfig<P> {
  options?: {
    content?: string[];
    breakpoints?: Record<string, string>;
    modes?: readonly string[];
  };
  primitives?: P;
  semantics: object;
  modes?: object;
  responsive?: object;
}

export type ExtractP<C> = C extends { primitives: infer P } ? P : unknown;
export type ExtractS<C> = C extends { semantics: infer Sem } ? Sem : unknown;
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

export type ExtractModeOptions<C> = C extends { options?: { modes?: infer M } }
  ? M extends ReadonlyArray<string>
    ? M[number]
    : never
  : never;

export type HasCustomModes<C> = ExtractModeOptions<C> extends never ? false : true;

export type AllowedModes<C> = HasCustomModes<C> extends true
  ? ExtractModeOptions<C>
  : ValidModeName;

export type ValidateModes<M, S, P, C> = {
  [K in keyof M]: K extends AllowedModes<C>
    ? ValidateOverrides<M[K], DeepPartialPaths<SafeNoInfer<S>, P>>
    : "Error: Mode name must be a valid default mode ('dark', 'light') or defined in options.modes";
};

export type CorePrimitives = {
  size: DefaultSizes;
};

export type ValidateBreakpoints<B> = {
  [K in keyof B]: K extends `${string}Max`
    ? "Error: Max breakpoints are auto-generated. Please define base names only."
    : B[K] extends ValidBreakpointValue
      ? B[K]
      : ValidBreakpointValue | "Error: Breakpoint values must be a valid size dot-path (e.g. 'size.100') or a rem value (e.g. '40rem')"
};

export type ExtractB<C> = C extends { options?: { breakpoints?: infer B } }
  ? B extends undefined
    ? {}
    : B
  : {};

export type CustomKeys<C> = keyof ExtractB<C> & string;
export type HasCustomBreakpoints<C> = CustomKeys<C> extends never ? false : true;
export type HasOnlyDefaultOverrides<C> = Exclude<CustomKeys<C>, BaseBreakpointName> extends never ? true : false;

export type AllowedBaseBreakpoints<C> = HasCustomBreakpoints<C> extends true
  ? HasOnlyDefaultOverrides<C> extends true
    ? BaseBreakpointName
    : CustomKeys<C>
  : BaseBreakpointName;

export type AllowedBreakpoints<C> = AllowedBaseBreakpoints<C> | `${AllowedBaseBreakpoints<C>}Max`;

export type ValidateResponsive<R, S, P, C> = {
  [K in keyof R]: K extends AllowedBreakpoints<C>
    ? ValidateOverrides<R[K], DeepPartialPaths<SafeNoInfer<S>, P>>
    : "Error: Responsive key must be a valid base breakpoint name. Max breakpoints are generated natively.";
};

export type ValidatedConfig<P, C> = {
  options?: {
    breakpoints?: ValidateBreakpoints<ExtractB<C>>;
  };
  primitives?: P;
  semantics: ExpectedShape<ExtractS<C>, P & CorePrimitives>;
  modes?: ValidateModes<ExtractM<C>, ExtractS<C>, P & CorePrimitives, C>;
  responsive?: ValidateResponsive<ExtractR<C>, ExtractS<C>, P & CorePrimitives, C>;
};
