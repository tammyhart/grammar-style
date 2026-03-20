import { expect, test, vi } from "vitest"

import createLinariaTheme from "./linaria"
import createTailwindTheme from "./tailwind"
import createVanillaExtractTheme from "./vanilla-extract"
import createStylexTheme from "./stylex"
import createStyledComponentsTheme from "./styled-components"
import createEmotionTheme from "./emotion"
import createPandaTheme from "./panda"

vi.mock("../config", () => ({
  loadConfigSync: () => null
}))

vi.mock("styled-components", () => ({ createGlobalStyle: vi.fn() }))
vi.mock("@emotion/react", () => ({ Global: vi.fn(), css: vi.fn() }))
vi.mock("@vanilla-extract/css", () => ({ createGlobalTheme: vi.fn() }))
vi.mock("@stylexjs/stylex", () => ({ defineVars: vi.fn() }))
vi.mock("@linaria/core", () => ({ css: vi.fn() }))

test("all adapters throw if grammar.config.ts is missing natively", () => {
  const errMsg = "Grammar Style: Could not find grammar.config.ts"
  
  expect(() => createLinariaTheme()).toThrow(errMsg)
  expect(() => createTailwindTheme()).toThrow(errMsg)
  expect(() => createVanillaExtractTheme()).toThrow(errMsg)
  expect(() => createStylexTheme()).toThrow(errMsg)
  expect(() => createStyledComponentsTheme()).toThrow(errMsg)
  expect(() => createEmotionTheme()).toThrow(errMsg)
  expect(() => createPandaTheme()).toThrow(errMsg)
})
