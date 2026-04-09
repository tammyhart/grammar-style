import { defineGrammar } from "./index"

// ----------------------------------------------------------------------------
// RULE: px values are not allowed
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    spacing: {
      // @ts-expect-error - px values are not allowed
      value: "24px",
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid negative primitive path
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - invalid negative primitive path
    margin: { value: "-size.foo" },
  },
})

// ----------------------------------------------------------------------------
// RULE: negative variables must safely map
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {},
  semantics: {
    // @ts-expect-error - negative variables must gracefully resolve via TS checking
    margin: { value: "-spacing" },
  },
})

// BUT valid negative path
defineGrammar({
  primitives: {},
  semantics: {
    margin: { value: "-size.4" },
  },
})
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {
    color: {
      syntax: {
        900: "#000",
      },
    },
  },
  semantics: {
    color: {
      // @ts-expect-error - opacity 52 not in defaults
      value: "color.syntax.900/52",
    },
  },
})

// BUT should be allowed if defined in options:
defineGrammar({
  options: {
    opacities: [52],
  },
  primitives: {
    color: {
      syntax: {
        900: "#000",
      },
    },
  },
  semantics: {
    color: { value: "color.syntax.900/52" },
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid primitive path before opacity
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    color: {
      // @ts-expect-error - color.foo.bar does not exist before opacity
      value: "color.foo.bar/10",
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid primitive path inside blur
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    effect: {
      // @ts-expect-error - invalid primitive path inside blur
      value: "blur(size.foo)",
    },
  },
})

// BUT valid inside blur
defineGrammar({
  primitives: {},
  semantics: {
    effect: { value: "blur(size.4)" },
  },
})

// ----------------------------------------------------------------------------
// RULE: literal colors are not allowed outside primitives
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    color: {
      // @ts-expect-error - literal colors are not allowed outside primitives
      value: "#ff0000",
    },
  },
})

// BUT allowed in primitives
defineGrammar({
  primitives: {
    color: {
      primary: "#ff0000",
    },
  },
  semantics: {
    color: { value: "color.primary" },
  },
})

// ----------------------------------------------------------------------------
// RULE: Non-token string validation
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    foo: {
      // Allowed: random generic CSS strings or words that don't look like token paths
      value: "random_string",
    },
    bar: {
      // Allowed: transition tokens
      value: "0.2s ease",
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: This property does not exist in your semantics shape (Modes)
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {
    color: {
      syntax: {
        900: "#000",
        100: "#fff",
      },
    },
  },
  semantics: {
    color: { value: "color.syntax.900" },
  },
  modes: {
    dark: {
      // @ts-expect-error - property does not exist in semantics
      unknownProperty: "color.syntax.100",
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: This property does not exist in your semantics shape (Responsive)
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {},
  semantics: {
    spacing: { value: "size.4" },
  },
  responsive: {
    lg: {
      // @ts-expect-error - property does not exist in semantics
      unknownProperty: "size.200",
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: Mode name must be a valid default mode ('dark', 'light') or defined in options.modes
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {
    color: {
      syntax: {
        900: "#000",
        100: "#fff",
      },
    },
  },
  semantics: {
    color: { value: "color.syntax.900" },
  },
  modes: {
    // @ts-expect-error - invalid mode name
    alien: {
      color: { value: "color.syntax.100" },
    },
  },
})

// BUT valid if added to options.modes
defineGrammar({
  options: {
    modes: ["alien"],
  },
  primitives: {
    color: {
      syntax: {
        900: "#000",
        100: "#fff",
      },
    },
  },
  semantics: {
    color: { value: "color.syntax.900" },
  },
  modes: {
    alien: {
      color: { value: "color.syntax.100" },
    },
  },
})

// ----------------------------------------------------------------------------
// RULE: Opacity cannot be less than 0
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    // @ts-expect-error - opacity < 0
    opacities: [-10],
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Opacity must be <= 100
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    // @ts-expect-error - opacity > 100
    opacities: [101],
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Opacity must be whole number logically, but type definition allows decimals
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    opacities: [10.5],
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Max breakpoints are auto-generated. Please define base names only.
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    breakpoints: {
      // @ts-expect-error - Max breakpoints not allowed
      lgMax: "60rem",
    },
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Breakpoint values must be a valid size dot-path (e.g. 'size.100') or a rem value (e.g. '40rem')
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    breakpoints: {
      // @ts-expect-error - px not allowed in breakpoints
      lg: "60px",
    },
  },
  semantics: {},
})

// BUT valid rem value
defineGrammar({
  options: {
    breakpoints: {
      lg: "60rem",
    },
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Responsive key must be an allowed breakpoint (including Max)
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {},
  responsive: {
    lgMax: {},
  },
})

// ----------------------------------------------------------------------------
// RULE: Multiple values in a string (e.g. shadow)
// ----------------------------------------------------------------------------
// Should error if any token is bad (in primitives, IsPrimitive=true)
defineGrammar({
  primitives: {
    shadow: {
      // @ts-expect-error - 24px is invalid token even in primitives
      value: "0 size.10 24px -size.100",
    },
  },
  semantics: {},
})

// Should succeed if valid
defineGrammar({
  primitives: {
    shadow: { value: "0 size.100 size.200 -size.100" },
  },
  semantics: {},
})

// ----------------------------------------------------------------------------
// RULE: Modifying single default breakpoint retains all other defaults
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    breakpoints: {
      sm: "size.10",
    },
  },
  semantics: {},
  responsive: {
    md: {},    // Valid: Retained default
    mdMax: {}, // Valid: Retained generated max
    sm: {},    // Valid: Modified
    smMax: {}, // Valid: Modified generated max
    // @ts-expect-error - 'lap' is not a valid breakpoint
    lap: {},
  },
})

// ----------------------------------------------------------------------------
// RULE: Passing completely custom breakpoint removes all defaults
// ----------------------------------------------------------------------------
defineGrammar({
  options: {
    breakpoints: {
      lap: "100rem",
    },
  },
  semantics: {},
  responsive: {
    lap: {},
    lapMax: {},
    // @ts-expect-error - 'md' default was removed because of entirely new custom dictionary
    md: {},
  },
})

// ----------------------------------------------------------------------------
// RULE: FilterToken safely extracts targeted token hierarchies
// ----------------------------------------------------------------------------
defineGrammar({
  primitives: {
    color: { primary: "#fff" },
    shadow: { sm: "0 0 0.1rem #000" },
  },
  semantics: {},
})

declare module "./types" {
  export interface Register {
    theme: {
      primitives: {
        color: { primary: "#fff" }
        shadow: { sm: "0 0 0.1rem #000" }
      }
      semantics: {}
    }
  }
}

import { type TokenPath } from "./types"

const _colorTarget: TokenPath<"color"> = "color.primary"
const _colorOpacityTarget: TokenPath<"color"> = "color.primary/10"

// @ts-expect-error - shadow.sm is mapped explicitly to shadow, not color
const _badColorTarget: TokenPath<"color"> = "shadow.sm"

// ----------------------------------------------------------------------------
// RULE: IDE Autocompletion Fallback Preservation
// ----------------------------------------------------------------------------
import type { PathToDots, ExpectedRootShape, CorePrimitives } from "./types"

type AutocompletePrimitives = CorePrimitives & {
  color: { primary: "#fff" }
}

// Simulates evaluating an incomplete string inside the semantics config
type IncompleteStringEvaluation = ExpectedRootShape<
  { namespace: { token: "color.unfinish" } },
  AutocompletePrimitives,
  never
>["namespace"]["token"]

// If DX autocompletion logic breaks, the type drops the valid token paths and only returns the Error string.
// This test asserts that the full native PathToDots union must strictly remain in the fallback union.
// If someone accidentally removes the fallback, this will falsely evaluate, throwing an assignability type error.
const _dxTokenPreservation: PathToDots<AutocompletePrimitives> extends IncompleteStringEvaluation ? true : false = true

