# grammar-style

A zero-runtime, framework-agnostic token resolution engine for design systems. Build your tokens once, and map them instantly into your favorite styling tools with strictly typed, auto-completing safety.

## Installation

```bash
npm install grammar-style
```

### Initializing your Token Configuration

Generate a `grammar.config.ts` boilerplate file right in your project:

```bash
npx grammar-init
```

## Native Tool Integrations

Grammar Style natively builds out the dynamic maps mapping exactly perfectly for the strict validation bindings inside your framework of choice without running heavy compiler layers.

Plug-and-play paths have been written for:

### Linaria

```javascript
import { createLinariaTheme } from "grammar-style/adapters/linaria"
```

### Tailwind CSS

```javascript
import { createTailwindTheme } from "grammar-style/adapters/tailwind"
```

### StyleX

```javascript
import { createStylexTheme } from "grammar-style/adapters/stylex"
```

### Vanilla Extract

```javascript
import { createVanillaExtractTheme } from "grammar-style/adapters/vanilla-extract"
```

### Styled Components

```javascript
import { createStyledComponentsTheme } from "grammar-style/adapters/styled-components"
```

### Emotion

```javascript
import { createEmotionTheme } from "grammar-style/adapters/emotion"
```

### Panda CSS

```javascript
import { createPandaTheme } from "grammar-style/adapters/panda"
```
