import { createTheme, loadConfig, token } from "../src"

// Create an async runner to simulate reading the config
async function run() {
  const config = await loadConfig(__dirname)

  if (!config) {
    throw new Error("Could not find grammar.config.ts")
  }

  // Generate the raw theme using the config object!
  const myTheme = createTheme(config)

  // Prove that CSS is generated properly
  console.log("----- GENERATED CSS -----")
  console.log(myTheme.cssText)

  // In a real project they still map their own project's type registry to our Engine for the typed token() function
  // We can't do this dynamically because TS is a build-time step, but they do it directly!
}

run()
