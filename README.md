# build-variants

Type-safe style composition for CSS-in-JS objects.

`build-variants` helps you build a style object from component props without pushing variant logic into the component body. It works well with Emotion, styled-components, MUI, or any setup that consumes plain object styles.

## Requirements

- Node.js 20 or newer for local development, validation, and release workflows.

## Installation

```bash
npm install @productive-codebases/build-variants
```

## Quick Start

Create a small factory once for your style object type:

```ts
import type { CSSObject } from '@emotion/react'
import { newBuildVariants } from '@productive-codebases/build-variants'

export function buildVariants<TProps extends object>(props: TProps) {
  return newBuildVariants<TProps, CSSObject>(props)
}
```

Use it inside your styled component:

```tsx
import styled from '@emotion/styled'
import { buildVariants } from './buildVariants'

interface ButtonProps {
  tone?: 'primary' | 'danger'
  emphasis?: Array<'strong' | 'quiet'>
}

export const Button = styled.button<ButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '8px'
    })
    .variant('tone', props.tone, {
      primary: {
        background: '#111827',
        color: '#ffffff'
      },
      danger: {
        background: '#b91c1c',
        color: '#ffffff'
      }
    })
    .variants('emphasis', props.emphasis, {
      strong: { fontWeight: 700 },
      quiet: { opacity: 0.72 }
    })
    .end()
})
```

## Builder API

### `css()` and `values()`

Add a raw object block:

```ts
buildVariants(props)
  .css({ color: 'red' })
  .end()
```

Or use an isolated nested builder when a block needs local composition:

```ts
buildVariants(props)
  .css(builder => {
    return {
      ':hover': builder.get('tone', 'danger').end()
    }
  })
  .end()
```

`values()` is an alias of `css()` when you are composing object shapes that are not strictly CSS.

### `variant()`

Apply one style block from a single prop value:

```ts
buildVariants(props)
  .variant('tone', props.tone, {
    primary: { background: 'royalblue' },
    danger: { background: 'crimson' }
  })
  .end()
```

Boolean props are supported through `true` and `false` keys:

```ts
buildVariants(props)
  .variant('disabled', props.disabled, {
    true: { opacity: 0.5 },
    false: {}
  })
  .end()
```

### `variants()`

Apply several style blocks from an array prop:

```ts
buildVariants(props)
  .variants('emphasis', props.emphasis, {
    strong: { fontWeight: 700 },
    quiet: { opacity: 0.72 }
  })
  .end()
```

### `compoundVariant()` and `compoundVariants()`

Compose styles from already defined variants:

```ts
interface ButtonProps {
  tone?: 'primary' | 'danger'
  _surface?: 'neutral' | 'danger'
  _text?: Array<'light' | 'strong'>
}

buildVariants(props)
  .variant('_surface', props._surface, {
    neutral: { background: '#111827' },
    danger: { background: '#b91c1c' }
  })
  .variants('_text', props._text, {
    light: { color: '#ffffff' },
    strong: { fontWeight: 700 }
  })
  .compoundVariant('tone', props.tone, {
    primary: builder =>
      builder.get('_surface', 'neutral').get('_text', ['light']).end(),
    danger: builder =>
      builder
        .get('_surface', 'danger')
        .get('_text', ['light', 'strong'])
        .end()
  })
  .end()
```

Use `compoundVariants()` when the source prop is also an array.

### `if()`

Conditionally apply either a raw block or a nested builder block:

```ts
buildVariants(props)
  .if(props.disabled === true, {
    cursor: 'not-allowed'
  })
  .if(props.interactive === true, builder => {
    return builder.css({ ':hover': { opacity: 0.88 } }).end()
  })
  .end()
```

### `get()`

Reuse a previously declared variant definition without re-declaring the CSS:

```ts
buildVariants(props)
  .variant('_surface', props._surface, {
    neutral: { background: '#111827' },
    danger: { background: '#b91c1c' }
  })
  .css(builder => builder.get('_surface', 'danger').end())
  .end()
```

### `replace()`

Transform a final property into another shape after the full merge:

```ts
buildVariants(props)
  .css({ opacity: 0.5 })
  .replace('opacity', value => {
    return {
      '--button-opacity': String(value)
    }
  })
  .end()
```

### `debug()`

Log props, registered variants, and merged parts while building:

```ts
buildVariants(props)
  .debug(process.env.NODE_ENV !== 'production')
  .end()
```

## Ordering Rules

- Later blocks override earlier ones by default.
- `weight` lets you force a block to apply later.
- Private props prefixed with `_` are applied after public variants when weights are equal.
- `compoundVariant()` and `get()` only work with variants already registered on the same builder chain.

Example with `weight`:

```ts
buildVariants(props)
  .css({ color: 'black' })
  .variant('_text', props._text, {
    subtle: { color: '#6b7280' }
  })
  .css({ color: 'tomato' }, { weight: 10 })
  .end()
```

The last block wins because of its higher weight.

## Private Variants

Props starting with `_` are useful for internal composition. They let you keep a small public API while still reusing lower-level style fragments.

```tsx
<Button tone="danger" _surface="neutral" />
```

That pattern keeps `tone` as the public API and still allows internal overrides when needed.

## Non-CSS Objects

The builder is generic. You can use it to compose any object shape, not only `CSSObject`.

```ts
type Tokens = {
  color?: string
  radius?: string
}

const tokens = newBuildVariants<{ tone?: 'brand' | 'neutral' }, Tokens>({
  tone: 'brand'
})
  .values({ radius: '8px' })
  .variant('tone', 'brand', {
    brand: { color: '#2563eb' },
    neutral: { color: '#374151' }
  })
  .end()
```

## API Summary

- `newBuildVariants(props)` creates a new builder.
- `css()` and `values()` add base object blocks.
- `variant()` and `variants()` attach prop-driven blocks.
- `compoundVariant()` and `compoundVariants()` compose from registered variants.
- `if()` applies a block conditionally.
- `get()` reuses an existing variant definition.
- `replace()` rewrites final properties.
- `debug()` prints internal builder state.
- `end()` returns the merged object.

## Examples

- https://codesandbox.io/s/1-init-b5t24e?file=/src/buildVariants.ts
- https://codesandbox.io/s/1-init-b5t24e?file=/src/Button.tsx
- https://codesandbox.io/s/2-add-css-0zmimn?file=/src/Button.tsx
- https://codesandbox.io/s/3-add-variant-9b3bvh?file=/src/Button.tsx
- https://codesandbox.io/s/4-multiple-variants-v9bxds?file=/src/Button.tsx
- https://codesandbox.io/s/5-variants-composition-m6b5zs?file=/src/Button.tsx
- https://codesandbox.io/s/overrides-with-private-variants-w72ed1?file=/src/App.tsx
- https://codesandbox.io/s/7-condition-blocks-0xko7x?file=/src/Button.tsx
- https://codesandbox.io/s/8-blocks-weight-d0fbz3?file=/src/Button.tsx
- https://codesandbox.io/s/9-debug-f6ozbu?file=/src/Button.tsx:463-2386
