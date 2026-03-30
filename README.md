# @vectosolve/sdk

Official TypeScript/Node.js SDK for the [VectoSolve](https://vectosolve.com) API.

Convert images to SVG, remove backgrounds, upscale images, and generate logos — all with a single API key.

## Install

```bash
npm install @vectosolve/sdk
```

## Quick Start

```typescript
import { VectoSolve } from '@vectosolve/sdk'

const client = new VectoSolve({ apiKey: 'vs_your_api_key' })

// Vectorize an image
const result = await client.vectorize('./photo.png')
console.log(result.data.svg) // Clean SVG string

// From a URL
const result2 = await client.vectorize('https://example.com/logo.png')
```

Get your API key at [vectosolve.com/developers](https://vectosolve.com/developers).

## Methods

### `vectorize(input, options?)`

Convert a raster image to clean SVG vector format.

```typescript
// Standard vectorization
const { data } = await client.vectorize('./image.png')

// With mode preset
const { data } = await client.vectorize('./image.png', { mode: 'hd' })
```

**Modes:** `standard`, `hd`, `cricut`, `laser`, `embroidery`, `stencil`, `coloring`, `stamp`

**Cost:** $0.20 per image

### `removeBackground(input)`

Remove the background from an image. Returns transparent PNG.

```typescript
const { data } = await client.removeBackground('./product.jpg')
// data.image = base64 PNG
```

**Cost:** $0.07 per image

### `upscale(input, options?)`

AI upscale to 2x or 4x resolution.

```typescript
const { data } = await client.upscale('./icon.png', { scale: 4 })
```

**Cost:** $0.15 per image

### `generateLogo(options)`

Generate SVG logos from a text prompt.

```typescript
const { data } = await client.generateLogo({
  prompt: 'Modern tech startup logo, blue and green',
  style: 'icon',
  colors: ['#0090ff', '#1cb721'],
  numVariants: 4,
})
// data.svgs = array of SVG strings
```

**Styles:** `vector_illustration`, `icon`, `line_art`, `engraving`, `line_circuit`, `linocut`

**Cost:** $0.25-$0.40 per generation

### `generatePattern(options)`

Generate repeating SVG patterns.

```typescript
const { data } = await client.generatePattern({
  prompt: 'Geometric triangles in navy and gold',
})
```

**Cost:** $0.25 per pattern

## Input Types

All image methods accept:
- **File path** — `'./photo.png'`
- **URL** — `'https://example.com/image.png'`
- **Buffer** — `Buffer` or `Blob` instance

## Error Handling

```typescript
import { VectoSolve, VectoSolveError } from '@vectosolve/sdk'

try {
  await client.vectorize('./photo.png')
} catch (err) {
  if (err instanceof VectoSolveError) {
    console.error(err.message) // "Insufficient credits"
    console.error(err.status)  // 402
  }
}
```

## Credits

Every API call consumes credits from your [VectoSolve](https://vectosolve.com) account. Purchase credits or subscribe at [vectosolve.com/pricing](https://vectosolve.com/pricing).

## Links

- [VectoSolve](https://vectosolve.com) — AI-powered image to SVG converter
- [API Documentation](https://vectosolve.com/developers)
- [Pricing](https://vectosolve.com/pricing)
- [MCP Server](https://github.com/Vectosolve/vectosolve-mcp) — Use VectoSolve from Claude Code & Cursor
- [GitHub Action](https://github.com/Vectosolve/vectosolve-action) — Vectorize in CI/CD pipelines

## License

MIT
