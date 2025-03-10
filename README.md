# Build-variants

Declaratively build style objects based on your React component props with a clean, type-safe API.

---

## Introduction

**Build-variants** helps you organize and compose CSS (or any style values) based on component props. It separates styling logic from component logic, making your code easier to maintain and extend. Note that it is a *builder*—it doesn’t apply styles by itself but returns an object your CSS-in-JS library can use.

---

## Installation

```bash
npm install @productive-codebases/build-variants
```

---

## Usage

### 1. Setup Your Factory Function

Configure **build-variants** with your styling engine. For example, with _styled-components_:

```ts
import type { CSSObject } from '@emotion/react'
import { newBuildVariants } from '@productive-codebases/build-variants'

export function buildVariants<TProps extends object>(props: TProps) {
  return newBuildVariants<TProps, CSSObject>(props)
}
```

*This sets up a function that accepts props and returns a builder configured for CSSObject objects.*

---

### 2. Decorate a Component

Integrate the builder with any styled function that accepts a CSSObject-like object. Whether you're using Emotion, styled-components, MUI, or any other library, the generated style object will work seamlessly.

```tsx
import styled from '@emotion/styled'
// Alternatively:
// import styled from 'styled-components'
// or import { styled } from '@mui/material', etc.
import { buildVariants } from './buildVariants'

const Div = styled.div(props => buildVariants(props).end())

export default function Button() {
  return <Div>My Button</Div>
}
```

*In this example, no extra styles are added; the builder returns an empty style object.*

---

### 3. Adding CSS Blocks

Chain CSS blocks to add styles:

```ts
const Div = styled.div(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    .css({
      background: 'blue',
      color: 'white'
    })
    .end()
})
```

**Applied styles:**
- `display: inline-block`
- `padding: 10px`
- `background: blue`
- `color: white`

---

### 4. Declaring Variants

#### Simple Variant

Define a style variant based on a prop value:

```tsx
import styled from '@emotion/styled'
import { buildVariants } from './buildVariants'

interface IButtonProps {
  type: 'primary' | 'secondary'
}

const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    .variant('type', props.type, {
      primary: {
        background: 'blue',
        color: 'white'
      },
      secondary: {
        background: 'silver',
        color: 'black'
      }
    })
    .end()
})

export default function Button(props: IButtonProps) {
  return <Div type={props.type}>My Button</Div>
}
```

**Applied styles:**

- **When `type="primary"`:**
  - Common: `display: inline-block`, `padding: 10px`
  - Variant: `background: blue`, `color: white`

- **When `type="secondary"`:**
  - Common: `display: inline-block`, `padding: 10px`
  - Variant: `background: silver`, `color: black`

---

#### Multiple Variants

Allow multiple variant values (e.g., text styles):

```tsx
interface IButtonProps {
  type: 'primary' | 'secondary'
  text?: Array<'strong' | 'success' | 'error'>
}

const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    .variant('type', props.type, {
      primary: {
        background: 'blue',
        color: 'white'
      },
      secondary: {
        background: 'silver',
        color: 'black'
      }
    })
    .variants('text', props.text, {
      strong: { fontWeight: 'bold' },
      success: { color: 'green' },
      error: { color: 'red' }
    })
    .end()
})
```

Usage example:

```tsx
// Renders a primary button with both bold and red text styles
<Button type="primary" text={['strong', 'error']} />
```

**Applied styles:**

- **Type "primary":** `background: blue`, `color: white`
- **Text variants:**
  - `strong` adds `fontWeight: bold`
  - `error` adds `color: red`
*Note: In case of conflicting styles (like two colors), the later applied style wins.*

---

#### Compound Variants

Compose multiple variants using private (internal) and public (external) props:

```tsx
interface IButtonProps {
  // Private variants (used for composing public ones)
  _background?: 'primary' | 'secondary' | 'success' | 'error'
  _text?: Array<'dark' | 'light' | 'success' | 'error' | 'strong'>
  // Public variant: the component's API
  type: 'primary' | 'secondary' | 'success' | 'error'
  children: string
}

const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    // Define private variants first.
    .variant('_background', props._background, {
      primary: { background: 'blue' },
      secondary: { background: 'silver' },
      success: { background: '#eaff96' },
      error: { background: '#ffdbdb' }
    })
    .variants('_text', props._text, {
      dark: { color: 'black' },
      light: { color: 'white' },
      success: { color: 'green' },
      error: { color: 'red' },
      strong: { fontWeight: 'bold' }
    })
    // Define compound variants mapping public 'type' to private ones.
    .compoundVariant('type', props.type, {
      primary: builder_ =>
        builder_.get('_background', 'primary').get('_text', ['light']).end(),
      secondary: builder_ =>
        builder_.get('_background', 'secondary').get('_text', ['dark']).end(),
      success: builder_ =>
        builder_.get('_background', 'success').get('_text', ['success']).end(),
      error: builder_ =>
        builder_
          .get('_background', 'error')
          .get('_text', ['error', 'strong'])
          .css({ border: '1px solid red' })
          .end()
    })
    .end()
})
```

Usage examples:

```tsx
<Button type="primary">Primary button</Button>
<Button type="secondary">Secondary button</Button>
<Button type="success">Success button</Button>
<Button type="error">Error button</Button>
```

**Applied styles:**

- **Primary:**
  - Private `_background: primary` → `background: blue`
  - Private `_text: ['light']` → `color: white`

- **Secondary:**
  - Private `_background: secondary` → `background: silver`
  - Private `_text: ['dark']` → `color: black`

- **Success:**
  - Private `_background: success` → `background: #eaff96`
  - Private `_text: ['success']` → `color: green`

- **Error:**
  - Private `_background: error` → `background: #ffdbdb`
  - Private `_text: ['error', 'strong']` → `color: red` and `fontWeight: bold`
  - Additional style: `border: 1px solid red`

---

### 5. Overriding with Private Variants

Private variants have a higher precedence than public ones, allowing you to override the default behavior for specific use cases.

```tsx
<Button type="error">Error button</Button>

<Button type="error" _background="success">
  Error button with success background
</Button>
```

**Applied styles:**
- The first button applies the default compound variant for `error`.
- The second button overrides the `_background` variant to `"success"`, so it receives `background: #eaff96` (as defined in the success mapping) while keeping the other error-related styles.

---

### 6. Conditional Blocks

Enable or skip blocks of styles based on a condition:

```tsx
const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    // Other style blocks…
    .if(props.applyTextVariant === true, builder_ => {
      return builder_
        .variants('_text', props._text, {
          dark: { color: 'black' },
          light: { color: 'white' },
          success: { color: 'green' },
          error: { color: 'red' },
          strong: { fontWeight: 'bold' }
        })
        .end()
    })

    // Alternatively, if you only need to add simple CSS:
    // .if(props.applyTextVariant === true, {
    //   color: 'red'
    // })

    .compoundVariant('type', props.type, {
      // …
    })
    .end()
})
```

**Applied styles:**
- If `applyTextVariant` is true, the text-related styles are applied. Otherwise, they are skipped.

---

### 7. Blocks Weight

Control the order of style application by assigning a weight to each block:

```ts
const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    .css(
      { color: 'silver' },
      { weight: 10 }  // This block is applied later.
    )
    .variants('_text', props._text, {
      dark: { color: 'black' },
      // …
    })
    .end()
})
```

**Applied styles:**
- The `color: silver` style with weight 10 overrides any earlier conflicting `color` from `_text` if applied later.

---

### 8. Debugging

Log internal builder state to help diagnose complex style applications:

```tsx
const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    // Other style definitions…
    .debug()
    .end()
})
```

Or enable debugging conditionally:

```tsx
interface IButtonProps {
  debug?: boolean
}

const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    // Other style definitions…
    .debug(props.debug === true)
    .end()
})
```

**Result:** Detailed logs in the console show which styles are applied and the builder's internal state.

---

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

---

## Summary

Build-variants empowers you to:
- **Declare and compose style variants** with a clean, declarative, and type-safe API.
- **Separate styling logic** from component code.
- **Support multiple, compound, and conditional variants** for flexible component design.
- **Control style precedence** with block weights.
- **Debug** style composition effortlessly.

Enjoy building maintainable, flexible UI components with Build-variants!
