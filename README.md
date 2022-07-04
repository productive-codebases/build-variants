# Build-variants

Single function to create, manage, compose variants, for any CSS-in-JS libraries.


## Installation

```bash
npm install build-variants
```

## How to use

### Step 1 - build-variants configuration

To be able to use build-variants with your CSS-in-JS library and get valid typings
for your CSS/styles, you need to specify the type of the CSS object.

To do so, you can create a simple function that expose `newBuildVariants` with
the CSS interface that you want to use.

For example with styled-components:

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

Note: If your library doesn't expose typings or if you are doing raw CSS only with
React, you can use `React.CSSProperties` for example.

You can even use you own CSS declaration if you want to use build-variants in a
totally different context:

```ts
import { newBuildVariants } from 'build-variants'

// build-variants typings will only tolerate CSS with color and background properties!
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


### Step 2 - Build your variants


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

/* CSS will be:

{
  // Defined in the first block
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

### About private and public variants

It is a proposal to manage variants with a different level of visibility but there is no obligation at all to follow this pattern.

The interesting approach with private and public variants is that you and your consumers have maximum flexibility.

Consumers are incited to use only public variants and it's recommended to communicate only on "official" and "public" variants  but if a custom specific need is required, consumers can use internal variants and customize the component as their needs. It's not recommended but sometimes, pragmatism is a good thing.


Have fun building variants! :)
