---
"grammar-style": minor
---

- **Optional Structural Scalability**: The `size` configuration scale is officially rigidly scaled by default. However, configuring `options: { useStrictSizes: false }` turns this off. This allows you to use arbitrary tokens like `size.15` effortlessly anywhere inside your config semantics and inside `token()` utilities without triggering Type-Checking compilation errors permanently.
