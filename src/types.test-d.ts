import { defineGrammar } from "./index"

// ----------------------------------------------------------------------------
// RULE: px values are not allowed
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - px values are not allowed
    spacing: "24px",
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
    margin: "-size.4",
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
    // @ts-expect-error - opacity 52 not in defaults
    color: "color.syntax.900/52",
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
    color: "color.syntax.900/52",
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid primitive path before opacity
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - color.foo.bar does not exist before opacity
    color: "color.foo.bar/10",
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid primitive path inside blur
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - invalid primitive path inside blur
    effect: "blur(size.foo)",
  },
})

// BUT valid inside blur
defineGrammar({
  primitives: {},
  semantics: {
    effect: "blur(size.4)",
  },
})

// ----------------------------------------------------------------------------
// RULE: literal colors are not allowed outside primitives
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - literal colors are not allowed outside primitives
    color: "#ff0000",
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
    color: "color.primary",
  },
})

// ----------------------------------------------------------------------------
// RULE: invalid token
// ----------------------------------------------------------------------------
defineGrammar({
  semantics: {
    // @ts-expect-error - random string is invalid token
    foo: "random_string",
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
    color: "color.syntax.900",
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
    spacing: "size.4",
  },
  responsive: {
    lap: {
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
    color: "color.syntax.900",
  },
  modes: {
    // @ts-expect-error - invalid mode name
    alien: {
      color: "color.syntax.100",
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
    color: "color.syntax.900",
  },
  modes: {
    alien: {
      color: "color.syntax.100",
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
      lapMax: "60rem",
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
      lap: "60px",
    },
  },
  semantics: {},
})

// BUT valid rem value
defineGrammar({
  options: {
    breakpoints: {
      lap: "60rem",
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
    lapMax: {},
  },
})

// ----------------------------------------------------------------------------
// RULE: Multiple values in a string (e.g. shadow)
// ----------------------------------------------------------------------------
// Should error if any token is bad (in primitives, IsPrimitive=true)
defineGrammar({
  primitives: {
    // @ts-expect-error - 24px is invalid token even in primitives
    shadow: "0 size.10 24px -size.100",
  },
  semantics: {},
})

// Should succeed if valid
defineGrammar({
  primitives: {
    shadow: "0 size.100 size.200 -size.100",
  },
  semantics: {},
})
