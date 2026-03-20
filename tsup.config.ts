import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/adapters/*.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "@linaria/core",
    "styled-components",
    "@emotion/react",
    "react",
    "react-dom",
  ],
})
