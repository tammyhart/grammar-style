import type { AllowedBreakpoints, ThemeConfig, Register } from "./types"
type Config = Register extends { theme: infer T } ? T : ThemeConfig<any, any>
type Breakpoints = AllowedBreakpoints<Config>

// Default empty generated file. Overwritten by the CLI.
export const media: Record<Breakpoints, string> = {} as Record<Breakpoints, string>
export const breakpoint: Record<Breakpoints, string> = {} as Record<Breakpoints, string>
export const hasGenerated = false
