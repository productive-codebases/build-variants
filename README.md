# Build-variants

Declare and compose styles variants with ease.

## Motivation

CSS-in-JS (Javascript that applies the styles of your components at runtime) is a very powerful technique but is generally mixed into your components logic and is sometimes very combersome.

Defining variants (the different variations of styles) of your components is also a touchy approach that requires a lot of attention to be simple, flexible and meaningful for the developers that will use them.

`Build-variants` offers a clean, declarative, and type-safe API to organize the different variants of your components allowing better maintainability and flexibility in time.

## Prerequisites

Typescript is not mandatory but highly recommended. Build-variants leverages a lot on Typescript generics and inference to provide types checking at every level.

## Installation

```bash
npm install @productive-codebases/build-variants
```

## Core concepts

At its core, `build-variants` is a tool that is building an object which can be styles or anything else according to the values of an object.

Applied to web development, `build-variants` can be used to build styles object from components props.

`build-variants` is **not** a CSS-in-JS library and don't manage styles. It is only **a builder** for your styles library.

`Build-variants` is totally agnostic and has no dependencies on a specific web framework or styles library. It can be use to build styles, animations or objects of a totally different context. It's a versatile tool!

The API of `build-variants` exposes functions to add CSS (or `values` if we are in a different context), variant(s) and compound variant(s) which are variant(s) composed from existing ones.

`Build-variants` introduces the concept of private and public variants, a way to differentiate the public interfaces from the intrinsic characteristics of your components.

Both are exposed as standard props so developers can use public variants for the "official" use-cases but can still compose or override a defined behavior by using private variants.

All those concepts provide the best maintainability and flexibility in the implementation of your variants.

## Usage

### Create your build-variants factory function

As `build-variants` is totally agnostic, you have to specify which interface you want to use through `build-variants`.

In the context of styles/CSS, you may use the interface exposed by the library of the framework you are using to decorate your components.

Example with `styled-components`:

```ts
import { newBuildVariants } from 'build-variants'
import { CSSObject } from 'styled-components'

/**
 * Return configured newBuildVariants with CSSObject from styled-components.
 */
export function buildVariants<TProps extends object>(props: TProps) {
  return newBuildVariants<TProps, CSSObject>(props)
}
```

[See CodeSandbox example.](https://codesandbox.io/s/1-init-b5t24e?file=/src/buildVariants.ts)

### Decorate a component

To decorate your component, use your own factory `buildVariants()` function when you are defining the styles of your component.

:warning: Please note that the library that you are using to apply styles needs to support object notation, as `build-variants` will return an object.

```tsx
import styled from 'styled-components'
import { buildVariants } from './buildVariants'

const Div = styled.div(props => {
  return buildVariants(props).end()
})

export default function Button() {
  return <Div>My Button</Div>
}
```

[See CodeSandbox example.](https://codesandbox.io/s/1-init-b5t24e?file=/src/Button.tsx)

### Add some CSS

To add some CSS, proceed as it:

```ts
const Div = styled.div(props => {
  return (
    buildVariants(props)
      .css({
        display: 'inline-block',
        padding: '10px'
      })
      // you can add as many blocks as you want
      .css({
        background: 'blue',
        color: 'white'
      })
      .end()
  )
})
```

[See CodeSandbox example.](https://codesandbox.io/s/2-add-css-0zmimn?file=/src/Button.tsx)

:arrow_right: If you are using `build-variants` in a different context than styles, you may prefer using the `value()` alias of `css()`.

:arrow_right: See also how `build-variants` can be used for [global styles](https://codesandbox.io/s/add-css-0zmimn?file=/src/App.tsx) as well.

### Declare variants

#### Simple variant

A variant is a characteristic of your component, for example the "type" of a button which could be "primary" or "secondary" and needs to be declared as a union of strings.

`Build-variants` will ensure that all values of the union are declared as a property of the object used to describe the styles of the variant.

At runtime, `build-variants` will return the styles that match the current props value.

Example:

```tsx
import styled from 'styled-components'
import { buildVariants } from './buildVariants'

interface IButtonProps {
  type: 'primary' | 'secondary'
}

// Note how IButtonProps is passed here as a generic to type the props argument.
// This construction may be different according to the styles library you are using.
const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
      .css({
        display: 'inline-block',
        padding: '10px'
      })
      // The first argument is the name of the prop and is used as a label inside
      // build-variants. It's used when building compound variants.

      // The second argument is the value of the variant used to "select" the correct
      // styles definition. You may use props directly here.

      // The third argument is your styles definition.
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
      // The end() function means the end of your build declaration. It triggers the whole styles build by deeply merging the differents styles values and return the final object
      .end()
  )
})

export default function Button(props: IButtonProps) {
  // `build-variants` needs to know the value of the `type` to apply the correct style.
  // Thanks to the `IButtonProps` passed to the styled function, the type is now required
  // and Typescript will ensure that all props are passed (if not declared as optional props).
  return <Div type={props.type}>My Button</Div>
}
```

[See CodeSandbox example.](https://codesandbox.io/s/3-add-variant-9b3bvh?file=/src/Button.tsx)

#### Multiple variants

A variant can be multiple meaning that different values of a same variant can be applied at the same time. It's pretty useful for a font that can be strong and green for example...

Consider this example:

```tsx
interface IButtonProps {
  type: 'primary' | 'secondary'
  // Declare an array of union values
  text?: Array<'strong' | 'success' | 'error'>
}

const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
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
      // The variants() function is working exactly the same than variant(), expect that it requires an array of values.
      // Build-variants will apply the styles definition of each value of the array.
      .variants('text', props.text, {
        strong: {
          fontWeight: 'bold'
        },
        success: {
          color: 'green'
        },
        error: {
          color: 'red'
        }
      })
      .end()
  )
})
```

```tsx
// Here an example to render a primary button with bolded red text
<Button type="primary" text={['strong', 'error']} />
```

[See CodeSandbox example.](https://codesandbox.io/s/4-multiple-variants-v9bxds?file=/src/Button.tsx)

### Declare compound variants by composing with existing variants

For more complex components, `build-variants` offers a composition API used to create variants from the ones previouly defined.

The public and private variants are a naming convention but work as any other property from a React perspective. However, the usage of both are different.

Private variants should be considered as the intrinsic properties of your components, used to build the public variants that should be considered as the public interface of your component.

For example, private variants may be background and color properties whereas public variant can be a type "primary" or "secondary" composed from a defined value of background and color.

Private variants need to start with an underscore and have the prevalence in the order of application by `build-variants`. The idea is to use public variants first, but for some edge cases where specific properties need to be overridden, it's possible to use a private variant.

Let's start by updating our component signature by exposing private and public variants. See how public variants are composed from private ones:

```tsx
interface IButtonProps {
  // define the private variants that will be used to compose your public variants
  _background?: 'primary' | 'secondary' | 'success' | 'error'
  _text?: Array<'dark' | 'light' | 'success' | 'error' | 'strong'>
  // define public variants that developpers should use
  type: 'primary' | 'secondary' | 'success' | 'error'
  children: string
}

const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
      .css({
        display: 'inline-block',
        padding: '10px'
      })
      // Private variants need to be defined first in order to be reused in your compound variants definitions
      .variant('_background', props._background, {
        primary: {
          background: 'blue'
        },
        secondary: {
          background: 'silver'
        },
        success: {
          background: '#eaff96'
        },
        error: {
          background: '#ffdbdb'
        }
      })
      .variants('_text', props._text, {
        dark: {
          color: 'black'
        },
        light: {
          color: 'white'
        },
        success: {
          color: 'green'
        },
        error: {
          color: 'red'
        },
        strong: {
          fontWeight: 'bold'
        }
      })
      // Define compound variants by composing with your private variants
      .compoundVariant('type', props.type, {
        primary: builder_ =>
          builder_.get('_background', 'primary').get('_text', ['light']).end(),
        secondary: builder_ =>
          builder_.get('_background', 'secondary').get('_text', ['dark']).end(),
        success: builder_ =>
          builder_
            .get('_background', 'success')
            .get('_text', ['success'])
            .end(),
        error: builder_ =>
          builder_
            .get('_background', 'error')
            .get('_text', ['error', 'strong'])
            // Note that the builder_ instance offers the same full API, so css() function is available here as well
            .css({
              border: '1px solid red'
            })
            .end()
      })
      .end()
  )
})
```

Usage:

```tsx
<Button type="primary">Primary button</Button>
<Button type="secondary">Secondary button</Button>
<Button type="success">Success button</Button>
<Button type="error">Error button</Button>
```

[See Codesandox example.](https://codesandbox.io/s/5-variants-composition-m6b5zs?file=/src/Button.tsx)

Note that `compoundVariants()` is also available and allows to apply multiple compound variants.

### Use private variants to override public ones

As mentioned in the previous section, private variants (props starting with an underscore) can be used to override public variants definitions, allowing to keep a maximum of flexibility.

For example, if a very specific use-case is not covered by the Button public variant, it is possible to override a (private) behavior of our component.

Example:

```tsx
<Button type="error">Error button</Button>

<Button type="error" _background="success">
  Error button with success background
</Button>
```

[See CodeSandbox example.](https://codesandbox.io/s/overrides-with-private-variants-w72ed1?file=/src/App.tsx)

The more granular your variants, the more flexible your component API. By having a few style definitions applied for each private variant, you can compose your different public variants more precisely while offering the maximum flexibility in the use of your component.

### Condition blocks

If you want to disable an entire block (`css()`, `variant()`...), you can use the `if()` function.

The main advantage is that you can condition a whole block easily without modifying the rest of your variants composition.

Example:

```tsx
const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
      // ...
      // Deactivate the _text variant according to the applyTextVariant prop
      .if(props.applyTextVariant === true, builder_ => {
        return builder_
          .variants('_text', props._text, {
            dark: {
              color: 'black'
            },
            light: {
              color: 'white'
            },
            success: {
              color: 'green'
            },
            error: {
              color: 'red'
            },
            strong: {
              fontWeight: 'bold'
            }
          })
          .end()
      })
      .compoundVariant('type', props.type, {
        // ...
      })
      .end()
  )
})
```

In this example, only the styles of the text is applyed according to the `applyTextVariant` prop, the rest (padding, background, border) is still applied.

:warning: Be careful to use the `builder_` instance returned by the `if` function.

[See CodeSandbox example.](https://codesandbox.io/s/7-condition-blocks-0xko7x?file=/src/Button.tsx)

### Blocks weight

Blocks are applied in the order of the declaration meaning that a `color` defined in a first `css` block would be overridden by a `color` applied lastly in a variant or compound variant definition.

`Build-variants` offers a way to add a weight to each block so that you can force some style directives to be applied in a defined order regardless of its declaration position.

Example:

```ts
const Div = styled.div<IButtonProps>(props => {
  return buildVariants(props)
    .css({
      display: 'inline-block',
      padding: '10px'
    })
    .css(
      {
        color: 'silver'
      },
      {
        // `color: silver` applied lastly thanks to its weight (0 by default),
        // so the final color of the button text will be `silver`.
        weight: 10
      }
    )
    .variants('_text', props._text, {
      dark: {
        color: 'black'
      }
      // ...
    })
    .end()
})
```

The `weight` option is available for css, variant(s) and compoundVariant(s).

[See CodeSandbox example.](https://codesandbox.io/s/8-blocks-weight-d0fbz3?file=/src/Button.tsx)

### Debugging

On complex components, you may encounter issues to understand which styles are really applied by `build-variants`. A `debug()` function is available to log `build-variants` internals and final applied styles.

Example:

```tsx
const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
      // ...

      // Enable console debugging
      .debug()
      .end()
  )
})
```

Note that the `debug` function accepts an optional predicate (boolean) value to enable or disable debugging. It is particularly useful to limit the logs to a specific use case.

Example:

```tsx
interface IButtonProps {
  // ...
  debug?: boolean
}

const Div = styled.div<IButtonProps>(props => {
  return (
    buildVariants(props)
      // ...

      // Enable console debugging only if the debug props has been passed to the component
      .debug(props.debug === true)
      .end()
  )
})
```


Now in the browser console, you get some logs that shoud help to understand which styles are applied:

![build-variants debugging](https://user-images.githubusercontent.com/446128/209950582-d7a7faf0-a496-4e3e-8469-d298ac09016b.png)

[See CodeSandbox example.](https://codesandbox.io/s/9-debug-f6ozbu?file=/src/Button.tsx:463-2386)
