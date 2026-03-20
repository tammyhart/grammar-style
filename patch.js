const fs = require('fs');
let code = fs.readFileSync('src/core.ts', 'utf8');

// 1. process.cwd check
code = code.replace(
  `if (fs && path) {`,
  `if (fs && path && typeof process !== 'undefined' && process.cwd) {`
);

// 2. Exception swallowing in statSync
code = code.replace(
  `} catch (e) {}
      return results`,
  `} catch (e) { console.warn("Grammar Style scanner: " + e) }
      return results`
);

// 3. Regex Misses inside Scanner:
code = code.replace(
  `const matches = content.match(/-?size\\.([A-Za-z0-9\\-]+)/g)`,
  `const matches = content.match(new RegExp(TOKEN_REGEX.source, "g"))`
);
code = code.replace(
  `} catch (e) {}
    })`,
  `} catch (e) { console.warn("Grammar Style scanner file read: " + e) }
    })`
);

// 4. Extracting Alpha logic (hex) and adding helper logic instead of copy-paste:
code = code.replace(
  `                  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
                  if (hex.length === 6 || hex.length === 8) {
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    convertedString = \`rgba(\${r}, \${g}, \${b}, \${a})\`;
                  }`,
  `                  if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(x => x + x).join('');
                  if (hex.length === 6 || hex.length === 8) {
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    let finalA = a;
                    if (hex.length === 8) {
                      finalA = a * (parseInt(hex.slice(6, 8), 16) / 255);
                    }
                    convertedString = \`rgba(\${r}, \${g}, \${b}, \${Number(finalA.toFixed(3))})\`;
                  }`
);

// 5. To solve #3 (Runtime tokens missing), run Regex replacement over getUsedSizes() returned tokens right after evaluating usedSizes!
const usedSizesLine = `const usedSizes = getUsedSizes(
    config as ThemeConfig<Record<string, unknown>, Record<string, unknown>>,
  )`;

const dynamicallyEvaluate = `const usedSizes = getUsedSizes(
    config as ThemeConfig<Record<string, unknown>, Record<string, unknown>>,
  )
  const regexGlobal = new RegExp(TOKEN_REGEX.source, "g");
  Array.from(usedSizes).forEach(t => {
     let tempObj = { value: t };
     try {
       createCssVars(tempObj as any, [], true, primitivesForCss as any, customOpacitiesOut);
     } catch(e) {} // SILENT fail for undefined dynamic tokens not mapped to primitives!
     t.replace(regexGlobal, (match, isNegative, tokenTarget) => {
        usedSizes.add(tokenTarget);
        if (isNegative) usedSizes.add(\`-\${tokenTarget}\`);
        return match;
     });
  });`;

code = code.replace(usedSizesLine, dynamicallyEvaluate);

fs.writeFileSync('src/core.ts', code);
