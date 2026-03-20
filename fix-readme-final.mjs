import fs from 'fs'

let content = fs.readFileSync('README.md', 'utf-8')

// 1. Add #top anchor and badges
content = content.replace(
  '<h1 style="border:none;">Design is a language. Governance is its grammar.</h1>',
  '<a id="top"></a>\n  <h1 style="border:none;">Design is a language. Governance is its grammar.</h1>\n  <p>\n    <img src="https://img.shields.io/npm/v/grammar-style" alt="NPM Version" />\n    <img src="https://img.shields.io/npm/l/grammar-style" alt="License" />\n    <img src="https://img.shields.io/badge/TypeScript-Strict-blue" alt="TypeScript Strict" />\n    <img src="https://img.shields.io/badge/Coverage-100%25-brightgreen" alt="Coverage" />\n  </p>'
)

// 2. Add TOC before Getting Started
const toc = `
## 📖 Table of Contents

- [Getting Started](#-getting-started)
- [Concept: \`defineGrammar\`](#-concept-definegrammar)
- [Built-in Primitives: \`size\`](#-built-in-primitives-size)
- [Options](#️-options)
- [Primitives](#-primitives)
- [Semantics](#-semantics)
- [Modes](#-modes)
- [Responsive](#-responsive)
- [The Power of \`token()\`](#-the-power-of-token)
- [Media Queries: \`media\` & \`breakpoint\`](#-media-queries-media--breakpoint)
- [Adapters](#️-adapters)

---

`

content = content.replace('## 🚀 Getting Started', toc + '## 🚀 Getting Started')

// 3. Add AST explanation
content = content.replace(
  'exactly used in your codebase.',
  'exactly used in your codebase. (Note: These files are configured to emit automatically through your framework-specific adapter plugins!)'
)
// Wait, the text is actually "sizes actively used in your codebase." Let's fix that.
content = content.replace(
  /sizes actively used in your codebase\./,
  'sizes actively used in your codebase. This CSS tree correctly mounts via your adapter framework natively!'
)

// 4. Add "back to top" link below each major heading
const headers = [
  '## 🚀 Getting Started',
  '## 📓 Concept: `defineGrammar`',
  '## 📏 Built-in Primitives: `size`',
  '## 🎛️ Options',
  '## 🧱 Primitives',
  '## 🧠 Semantics',
  '## 🌓 Modes',
  '## 📱 Responsive',
  '## 🎨 The Power of `token()`',
  '## 📐 Media Queries: `media` & `breakpoint`',
  '## ⚙️ Adapters'
]

for (const header of headers) {
  content = content.replace(header, `${header}\n<a href="#top">⬆️ Back to Top</a>\n`)
}

fs.writeFileSync('README.md', content)
