import { CSSObject } from 'styled-components'
import { newBuildVariants } from '../lib/newBuildVariants'

describe('BuildVariantsBuilder-Button', () => {
  function testBuildVariants<TProps extends object>(props: TProps) {
    return newBuildVariants<TProps, CSSObject>(props)
  }

  describe('Define a new Button', () => {
    it('should merge and apply css', () => {
      interface IButtonProps {
        // not used, only for testing
        __variantAsBoolean?: boolean
        __compoundVariantAsBoolean?: boolean
        __compoundVariantAsArray?: Array<'A' | 'B'>

        // atoms
        _background?: 'unset' | 'default' | 'primary' | 'secondary'
        _color?: 'unset' | 'default' | 'primary' | 'secondary'
        _border?: 'unset' | 'focused'

        // compose with atomic properties
        state?: Array<'focused' | 'loading' | 'disabled'>
        variant?: 'default' | 'primary' | 'secondary'
      }

      const theme = {
        sizes: {
          button: '30px'
        },
        colors: {
          white: '#ffffff',
          black: '#000000',
          blue: '#0079dd'
        }
      }

      const buttonProps: IButtonProps = {
        variant: 'primary',
        state: ['focused']
      }

      const css = testBuildVariants(buttonProps)
        .css({
          border: '1px solid silver',
          height: theme.sizes.button,
          borderRadius: theme.sizes.button
        })

        .css({
          '> button': {
            background: 'transparent',
            border: 'none'
          }
        })

        // ensure that usage with booleans does not trigger TS errors
        .variant(
          '__variantAsBoolean',
          buttonProps.__variantAsBoolean || false,
          {
            true: {
              //
            },

            false: {
              //
            }
          }
        )

        .variant('_background', buttonProps._background || 'unset', {
          unset: {
            //
          },

          default: {
            backgroundColor: theme.colors.white
          },

          primary: {
            backgroundColor: theme.colors.blue
          },

          secondary: {
            backgroundColor: theme.colors.white
          }
        })

        .variant('_color', buttonProps._color || 'unset', {
          unset: {
            //
          },

          default: {
            color: theme.colors.black
          },

          primary: {
            color: theme.colors.white
          },

          secondary: {
            color: theme.colors.blue
          }
        })

        .variant('_border', buttonProps._border || 'unset', {
          unset: {
            //
          },

          focused: {
            border: `2px solid ${theme.colors.black}`
          }
        })

        .variants('state', buttonProps.state || [], {
          focused: {
            border: `2px solid ${theme.colors.black}`
          },

          loading: {
            backgroundColor: 'silver'
          },

          disabled: {}
        })

        // ensure that usage with booleans does not trigger TS errors
        .compoundVariant(
          '__compoundVariantAsBoolean',
          buttonProps.__compoundVariantAsBoolean || false,
          {
            true: builder => builder.end(),
            false: builder => builder.end()
          }
        )

        // ensure that usage with arrays does not trigger TS errors
        .compoundVariants(
          '__compoundVariantAsArray',
          buttonProps.__compoundVariantAsArray || [],
          {
            A: builder => builder.end(),
            B: builder => builder.end()
          }
        )

        .compoundVariant('variant', buttonProps.variant || 'default', {
          default: builder => {
            return builder
              .get('_background', 'default')
              .get('_color', 'default')
              .if(buttonProps.state?.includes('focused') === true, builder_ => {
                return builder_.get('_border', 'focused').end()
              })
              .end()
          },

          primary: builder => {
            return builder
              .get('_background', 'primary')
              .get('_color', 'primary')
              .end()
          },

          secondary: builder => {
            return builder
              .get('_background', 'secondary')
              .get('_color', 'secondary')
              .end()
          }
        })

        .end()

      expect(css).toEqual({
        height: '30px',
        // border: '1px solid silver',
        borderRadius: '30px',

        '> button': {
          background: 'transparent',
          border: 'none'
        },

        backgroundColor: '#0079dd',
        color: '#ffffff',
        border: '2px solid #000000'
      })
    })
  })
})
