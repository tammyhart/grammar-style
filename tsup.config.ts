import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/generated.ts", "src/adapters/*.ts", "!src/adapters/*.test.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "./generated",
    "@linaria/core",
    "styled-components",
    "@emotion/react",
    "react",
    "react-dom",
  ],
})
