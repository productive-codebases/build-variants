# Build-variants

Single function to create, manage, compose variants, for any CSS-in-JS libraries.


## Motivation

Before diving into the implementation details, you may want to read about [design considerations and motivation](#about-tokens-and-global-variants).


## Installation

```bash
npm install build-variants
```

## Prerequisites

Typescript is not mandatory but highly recommended. Build-variants leverage a lot
on Typescript generics and inference to provide types checking at every level.


## How to use

### Intanciate build-variants

In order to use build-variants with any CSS-in-JS librairies, build-variants does not
provide a CSS interface by default, meaning that your styles objects can be anything.

To provide types checking for styles, you need to pass a type/interface to the
build-variants' `newBuildVariants` function.

Let's take an example with styled-components:


```ts
import { newBuildVariants } from 'build-variants'
import { CSSObject } from 'styled-components'

/**
 * Create a build-variants instance, typed to use styled-components's `CSSObject`s.
 */
export function buildVariants<TProps extends object>(props: TProps) {
  return newBuildVariants<TProps, CSSObject>(props)
}
```

Note that you can the interface you want. Consider using `React.CSSProperties`
if you are doing raw React styles or your custom object definition:

```ts
import { newBuildVariants } from 'build-variants'

// build-variants typings will only tolerate styles with color and background properties!
interface IMyStyles {
  color: string
  background: string
}

/**
 * Create a build-variants instance, to use Partial<IMyStyles>
 */
export function buildVariants<TProps extends object>(props: TProps) {
  return newBuildVariants<TProps, Partial<IMyStyles>>(props)
}
```


### Decorate your components

Now you can use your `buildVariants` function to build styles objects that will
be passed to your styled function - most of the time.


```tsx
import { buildVariants } from 'path/to/buildVariants'

// Use here styled-components but you can used any CSS-in-JS library you want
import { styled } from 'styled-components'

// Define the interface of the props used by your component
interface Props {
  // Define a 'private' property for the button font color
  _color?: 'default' | 'primary' | 'secondary'

  // Define a 'private' property for the button background
  _background?: 'default' | 'primary' | 'secondary'

  // Define a 'private' property for font variants.
  // This is an array, meaning that you can apply several values at once.
  _font?: Array<'default' | 'bold' | 'italic'>,

  // Define a 'private' property for a disabled state that is a boolean
  _disabled?: boolean

  // Finally, define a "public" variant
  type?: 'default' | 'primary' | 'secondary'
}

// Style a div component by using styled-components here.
const Div = styled.div<Props>(props => {
  // Get a new instance of build-variant.
  // Note that we use here `buildVariants()` defined in step 1 to be able to write
  // CSS styles as styled-components' CSS objects.
  return buildVariants(props)
    // Add some CSS.
    .css({
      background: 'white'
    })

    // Add more CSS.
    // You can add as many CSS blocks as you want.
    .css({
      '> button': {
        all: 'unset'
      }
    })

    // Implement CSS for each case of the color variant.
    // Everything is typed checked here. You have to implement all cases of the
    // union value.
    // Note that because _color is optional, we have to default on a default value,
    // here 'default', which is the first value of the union.
    .variant('_color', props._color || 'default', {
      default: {
        // No color for the default case, it will be inherited from a parent
      },

      primary: {
        color: 'white'
      },

      secondary: {
        color: 'black'
      }
    })

    // Same thing with the background variant
    .variant('_background', props._background || 'default', {
      default: {
        // No background override.
        // As we have define a background in the first CSS block, we should have
        // a background: white at the end.
      },

      primary: {
        background: 'blue'
      },

      secondary: {
        background: 'white'
      }
    })

    // Same thing with the font variant.
    // Note that we use `variant*s*` to manipulate an array of unions.
    .variants('_font', props._font || [], {
      default: {
        // Inherits from the parent
      },

      bold: {
        fontWeight: 'bold'
      },

      italic: {
        fontStyle: 'italic'
      }
    })

    // Same thing with the disabled variant which is a boolean.
    // Therefore we need to define the true and false cases.
    .variant('_disabled', props._disabled || [], {
      true: {
        background: 'silver'
      },

      false: {
        // Nothing is not disabled
      }
    }, {
      // When the button is disabled, we want that the background:silver takes
      // the precedence over all other backgrounds rules.
      // So you can use the `weight` option to ponderate your CSS definition(s).
      // Weight is also available for variant(s), compoundVariant(s) and if blocks.
      weight: 10
    })

    // You can conditionate any CSS or variant definition by using `if()` block.
    .if(
      // Implement the predicate function here to have a pink color in your button
      true    // OR `props.variants?.include('fancy') === true,
      builder => {
        return builder
          .css({
            color: 'pink'
          })
          .end()
      }
    )

    // The nice trick with `if` is that variants will be automatically "skipped"
    // from compound variants when being disabled.
    // For example here, the color variant will not be applyed if used into
    // compoundVariant (see below).
    .if(
      false,
      builder => {
        return builder
          .variant('_color', props._color || 'default', {
             // ...
          }
          .end()
      }
    )

    // Now, compose with your 'private' variants
    .compoundVariant('type', props.type || 'default', {
      // When composing, we get a new instance of the builder to get existing
      // private variants definitions.
      // Final `end()` function merges all CSS definitions get from the composition.
      // Here we don't want to style the default case, so we directly call the
      // end function.
      default: builder.end()

      // Here we define the type=primary variant from existing color, background
      // and font variants.
      // In this example, we use two definitions for the font variant. So the font
      // will be bold and italic.
      primary: builder
        .get('_color', 'primary')
        .get('_background', 'primary')
        .get('_font', ['bold', 'italic'])
        .end(),

      // In the same way, compose to define type=secondary variant.
      secondary: builder
        .get('_color', 'secondary')
        .get('_background', 'secondary')
        .get('_font', ['bold', 'italic'])

        // Not recommanded but you have the full API of the builder available here.
        // So you can create new CSS or variant(s) of event compoundVariant(s) in this
        // compoundVariant definition!
        // .css({
        //   background: 'white'
        // })

        .end()
    })

    // You can also compose with an array of compoundVariant by using compoundVariants:
    // .compoundVariants('types', props.types || [], {
    //   ...
    // })

    // If you have some issues and unexpected CSS applied, you may want debug things
    // so you can use `debug()` function that will log props, variants, CSS parts and
    // final merged CSS object.
    .debug()

    // Finally, merge all CSS definitions and variants.
    // End function will return a CSS object.
    .end()
})

// Create a component and render a disabled "primary" button.
function ButtonComponent() {
  return (
    <Div type="primary" disabled>
      <button>Button</button>
    </Div>
  )
}

/* CSS is going to be:

{
  // Get from the first CSS block
  '> button': {
    all: 'unset'
  },

  // Get the background set in the disabled variant. And because we added a weight
  // option, the background:silver takes the precedence over backgrounds set in
  // the primary variant (blue) and in the first CSS block (white).
  background: 'silver',

  // Get from the primary font variant, two variants applyed at the same time
  fontWeight: 'bold',
  fontStyle: 'italic'

  // Get from the primary color variant
  // (color:pink is not applyed because declared before the primary variant and
  // no weight value has been set)
  color: 'white'
}

*/
```

## Design considerations

### About private and public variants

It is a proposal to manage variants with a different level of visibility but there is no obligation at all to follow this pattern.

The interesting approach with private and public variants is that you and your consumers have maximum flexibility.

Consumers are incited to use only public variants and it's recommended to communicate only on "official" and "public" variants  but if a custom specific need is required, consumers can use internal variants and customize the component as their needs. It's not recommended but sometimes, pragmatism is a good thing.


### About variants versus props interpolation

Variants is something relatively new in CSS-in-JS world that libraries like Stitches have democratized by adding  first-class variant API support.

Stitches advocates [variants design instead of props interpolation)(https://stitches.dev/blog/migrating-from-emotion-to-stitches), meaning that variants are defined directly during the styles implementation, by infering definitions. It quicky adds complexity when it comes to extracting those variants in order to reuse them in another contexts. More generally, not having clear interfaces is rarely a good idea.

Build-variants vision is more as:

1. First, define clear interfaces for your components,
2. Secondly, implement your interface by defining CSS and variants.
3. Optionally, compose your variants if you need more high-level behaviors (like a "primary" type that defines a bunch of styles like colors, background and borders for example)

Build-variants provides both, a first-class variant API and props interpolation, allowing to define variants according to props values.


### About tokens

[Tokens](https://stitches.dev/docs/tokens) (strings) could be seen as a handly way to create shortcuts for complex styles definitions. But you should consider as well the drawbacks of using simple strings that can't reference the source of the implementation in addition that adding more and more aliases of styles may obfuscate a bit which styles are really applied at the end.

For values, you should better considerate importing directly what you need. If you need a custom set of styles, you can create a function and invokes it directly in styles definition.

```tsx
function monospaceFontStyles(): CSSObject {
  return {
    fontFamily: 'monospace',
    letterSpacing: '1em',
    fontWeight: 5000
  }
}

const StyledTextArea = styled.textarea(props => {
  return buildVariants(props)
    .css({
      color: 'black',
      ...monospaceFontStyles()
    })
    .end()
})
```


### About global variants

Instead of importing a function to inject styles, an another option could be to
define kind of global variants used to apply styles without having to import things
and without having to define the "same" variant in various places.

To do so, you can leverage of the initial `buildVariants` function that defines
the type to use for styles. Just add some variants definitions here and expose
an interface that you can use when styling your components.


```ts
// Define a ExtendedStyledProps type that will extend TProps with some
// default variants. Here we define a "font" variant.
export type ExtendedStyledProps<TProps extends object> = TProps & {
  font?: 'default' | 'monospace'
}

export function buildVariants<
  TProps extends object,
  // Create a generic that extends ExtendedStyledProps<TProps>, used to type props.
  TExtendedProps extends ExtendedStyledProps<TProps>
>(props: TExtendedProps) {
  return newBuildVariants<TExtendedProps, CSSObject>(props).variant(
    // use the props name as the variant label
    'font',
    // add a default fallback since "font" value can be optional
    props.font || 'default',
    // finally, implement the union values
    {
      default: {
        //
      },

      monospace: {
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        fontWeight: 5000
      }
    }
  )
}
```

Now, when styling a component, you can use the extended interface to expose the
global variants:

```tsx
const StyledTextArea = styled.textarea<
  // Type your typearea props as an ExtendedStyledProps<T> interface
  ExtendedStyledProps<HTMLAttributes<HTMLTextAreaElement>>
>(props => {
  return buildVariants(props)
    .css({
      color: 'black'
    })
    .end()
})

// "font" property is now available without having the need to define the variant,
// because already implemented in the `buildVariants` function.
() => <StyledTextArea maxLength={50} font="monospace" value="Hello World" />
```


Have fun building variants! :)
