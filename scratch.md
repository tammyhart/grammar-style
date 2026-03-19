You've hit on the exact fundamental limitation of client-side runtime CSS-in-JS utilities!

Because developers can name `semantics` absolutely any arbitrary word they want (e.g. `layout_gap`, `margin_lg`), and because `formatTokenToCssVar` exclusively executes directly inside the user's browser (where it does not, and *should not*, have access to their massive `grammar.config.ts` resolution tree), **there is physically no way for the Javascript executing in `token.ts` to statically know if a custom semantic string evaluates back to a `size.*` primitive under the hood.**

If we try to aggressively protect `isNegative` inside `token.ts` by checking if the string resolves correctly, we would literally have to import and bundle the entire `semantics` configuration mapping matrix down into the frontend client build, completely nuking your payload optimization.

### The Good News
We do not actually need to add a Javascript execution barrier here, because **we possess two flawless layers of native protection:**

1. **TypeScript (`ResolvesToSize`):** Your generic `ResolvesToSize` type completely automates this mapping hierarchy evaluation accurately at compile-time! If a developer writes `token("-color.primary")`, TypeScript fiercely throws a red line instantly because it statically determined `color.primary` doesn't mathematically map back to `size.*` in the config!
2. **Native CSS Engine Fallback:** Even if a rogue developer forcefully bypasses TypeScript using `token("-color.primary" as any)`, the Javascript just generates `calc(var(--color-primary) * -1)`. When the browser's CSS engine attempts to evaluate `#FF0000 * -1`, it natively marks it as an "Invalid Property Value" and gracefully ignores it silently without crashing the DOM.

Because of this, I strongly recommend we entirely remove the flawed runtime string-matching guard from `formatTokenToCssVar` and confidently rely exclusively on your watertight TypeScript constraints. The TS compiler dynamically calculates custom semantic mappings flawlessly during development where JIT rules belong! 

Shall I wipe out the flawed runtime string blacklist block from `utils.ts` so we maintain perfect 0kb decoupled logic?
