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

export type SafeNoInfer<T> = [T][T extends any ? 0 : never];

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : Primitive

export type PathBuilder<P, Prefix extends string = ""> = {
  [K in keyof P]: P[K] extends object 
    ? PathBuilder<P[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`
}

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
