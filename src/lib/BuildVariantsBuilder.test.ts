import { newBuildVariants } from './newBuildVariants'

interface ISampleCSSObject {
  color: string
  border: string
  fontSize: string
  background: string
  fontWeight: string
  textDecoration: string
  textDecorationLine: string
  opacity: number
}

describe('BuildVariantsBuilder', () => {
  function testBuildVariants<TProps extends object>(props: TProps) {
    return newBuildVariants<TProps, Partial<ISampleCSSObject>>(props)
  }

  describe('css()', () => {
    it('should merge and apply css', () => {
      const css = testBuildVariants({})
        .css({
          color: 'red',
          border: '1px solid black'
        })
        .css({
          color: 'lime',
          fontSize: '10px'
        })
        .end()

      expect(css).toEqual({
        color: 'lime',
        border: '1px solid black',
        fontSize: '10px'
      })
    })
  })

  describe('variant()', () => {
    it('should apply variant', () => {
      interface IButtonProps {
        type: 'default' | 'info' | 'success' | 'error'
        important: boolean
      }

      const props: IButtonProps = {
        type: 'success',
        important: true
      }

      const css = testBuildVariants(props)
        .variant('type', props.type, {
          default: {
            background: 'white'
          },

          info: {
            background: 'blue'
          },

          success: {
            background: 'green'
          },

          error: {
            background: 'red'
          }
        })
        .variant('important', props.important, {
          true: {
            textDecorationLine: 'underline'
          },

          false: {
            //
          }
        })
        .end()

      expect(css).toEqual({
        background: 'green',
        textDecorationLine: 'underline'
      })
    })
  })

  describe('variants()', () => {
    it('should apply several variants', () => {
      interface IButtonProps {
        font: Array<'strong' | 'underline' | 'italic'>
      }

      const props: IButtonProps = {
        font: ['strong', 'underline']
      }

      const css = testBuildVariants(props)
        .variants('font', props.font, {
          strong: {
            fontWeight: 'bold'
          },

          underline: {
            textDecorationLine: 'underline'
          },

          italic: {
            textDecoration: 'italic'
          }
        })
        .end()

      expect(css).toEqual({
        fontWeight: 'bold',
        textDecorationLine: 'underline'
      })
    })
  })

  describe('if()', () => {
    it('should apply or not css', () => {
      interface IButtonProps {
        type: 'success' | 'error'
      }

      const props: IButtonProps = {
        type: 'success'
      }

      const css = testBuildVariants(props)
        .if(false, builder_ => {
          return builder_
            .css({
              color: 'white'
            })
            .variant('type', props.type, {
              success: {
                background: 'green'
              },

              error: {
                background: 'red'
              }
            })
            .end()
        })
        .if(
          () => true,
          builder_ => {
            return builder_
              .css({
                color: 'silver'
              })
              .variant('type', props.type, {
                success: {
                  background: 'lime'
                },

                error: {
                  background: 'orange'
                }
              })
              .end()
          }
        )
        .end()

      expect(css).toEqual({
        color: 'silver',
        background: 'lime'
      })
    })
  })

  describe('compoundVariant()', () => {
    it('should compose variants from existing one', () => {
      interface IButtonProps {
        type?: 'default' | 'info' | 'success' | 'error'
        border?: 'unset' | 'solid' | 'dotted'
        important?: boolean
        variant: 'ok' | 'ko'
      }

      const props: IButtonProps = {
        variant: 'ko',
        border: 'solid'
      }

      const css = testBuildVariants(props)
        .variant('type', props.type || 'default', {
          default: {
            background: 'white'
          },

          info: {
            background: 'blue'
          },

          success: {
            background: 'green'
          },

          error: {
            background: 'red'
          }
        })
        // add a disabled variant that should not be reusable in composition
        .if(false, builder => {
          return builder
            .variant('border', props.border || 'unset', {
              unset: {},

              solid: {
                border: '1px solid solid'
              },

              dotted: {
                border: '1px solid dotted'
              }
            })
            .end()
        })
        .variant('important', props.important || false, {
          true: {
            textDecorationLine: 'underline'
          },

          false: {}
        })
        .compoundVariant('variant', props.variant, {
          ok: builder =>
            builder
              .get('type', 'success')
              .get('border', 'solid')
              .get('important', false)
              .end(),

          // compose the 'ko' variant from existing variants (even the 'falsy' ones)
          ko: builder =>
            builder
              .get('type', 'error')
              .get('border', 'dotted')
              .get('important', true)
              // add a bit of more css for fun
              .css({ color: 'pink' })
              .end()
        })
        .end()

      expect(css).toEqual({
        color: 'pink',
        background: 'red',
        textDecorationLine: 'underline'
      })

      // should not have border because disabled with if()
      expect(css).not.toHaveProperty('border')
    })

    it('should compose variants with existing compound variants', () => {
      interface IBoxProps {
        color?: 'unset' | 'red' | 'lime'
        font?: 'unset' | 'strong' | 'italic'
        border?: 'unset' | 'solid' | 'dotted'
        style?: 'unset' | 'style1' | 'style2'
        variant?: 'unset' | 'variant1' | 'variant2'
      }

      const props: IBoxProps = {
        variant: 'variant2'
      }

      const css = testBuildVariants(props)
        .variant('color', props.color || 'unset', {
          unset: {},
          red: {
            color: 'red'
          },
          lime: {
            color: 'lime'
          }
        })
        .variant('font', props.font || 'unset', {
          unset: {},
          strong: {
            fontWeight: 'bold'
          },
          italic: {
            textDecoration: 'italic'
          }
        })
        // add a disabled variant that should not be reusable in composition
        .if(false, builder => {
          return builder
            .variant('border', props.border || 'unset', {
              unset: {},
              solid: {
                border: '1px solid solid'
              },
              dotted: {
                border: '1px solid dotted'
              }
            })
            .end()
        })
        .compoundVariant('style', props.style || 'unset', {
          unset: builder_ => builder_.end(),
          style1: builder_ =>
            builder_.get('color', 'red').get('font', 'strong').end(),
          style2: builder_ =>
            builder_.get('color', 'lime').get('font', 'italic').end()
        })
        // compose a variant with a previous compound variant
        .compoundVariant('variant', props.variant || 'unset', {
          unset: builder_ => builder_.end(),
          variant1: builder => builder.get('style', 'style1').end(),
          variant2: builder =>
            builder.get('style', 'style2').css({ background: 'pink' }).end()
        })
        .end()

      expect(css).toEqual({
        color: 'lime',
        textDecoration: 'italic',
        background: 'pink'
      })

      // should not have border because disabled with if()
      expect(css).not.toHaveProperty('border')
    })
  })

  describe('compoundVariants()', () => {
    it('should apply several compound variants', () => {
      interface IBoxProps {
        color?: 'unset' | 'red' | 'lime'
        font?: 'unset' | 'strong' | 'italic'
        border?: 'unset' | 'solid' | 'dotted'
        style?: 'unset' | 'style1' | 'style2'
        variants?: Array<'unset' | 'variant1' | 'variant2'>
        disabled?: boolean
      }

      const props: IBoxProps = {
        variants: ['variant1', 'variant2']
      }

      const css = testBuildVariants(props)
        .variant('color', props.color || 'unset', {
          unset: {},
          red: {
            color: 'red',
            opacity: 0.9
          },
          lime: {
            color: 'lime'
          }
        })
        .variant('font', props.font || 'unset', {
          unset: {},
          strong: {
            fontWeight: 'bold'
          },
          italic: {
            textDecoration: 'italic'
          }
        })

        // add a disabled variant that should not be reusable in composition
        .if(false, builder => {
          return builder
            .variant('border', props.border || 'unset', {
              unset: {},
              solid: {
                border: '1px solid solid'
              },
              dotted: {
                border: '1px solid dotted'
              }
            })
            .end()
        })
        .compoundVariant('style', props.style || 'unset', {
          unset: builder_ => builder_.end(),
          style1: builder_ =>
            builder_.get('color', 'red').get('font', 'strong').end(),
          style2: builder_ =>
            builder_.get('color', 'lime').get('font', 'italic').end()
        })
        // add a compound variant from boolean
        .compoundVariant('disabled', props.disabled || false, {
          true: builder_ => {
            return builder_
              .css({
                textDecorationLine: 'overline'
              })
              .end()
          },
          false: builder_ => {
            return builder_.end()
          }
        })
        // compose a variant with a previous compound variant
        .compoundVariants('variants', props.variants || ['unset'], {
          unset: builder_ => builder_.end(),
          variant1: builder => builder.get('style', 'style1').end(),
          variant2: builder =>
            builder
              .get('style', 'style2')
              .get('disabled', true)
              .css({ background: 'pink' })
              .end()
        })
        .end()

      // should merge all compound variants (variants: ['variant1', 'variant2'])
      expect(css).toEqual({
        color: 'lime',
        opacity: 0.9,
        fontWeight: 'bold',
        textDecoration: 'italic',
        textDecorationLine: 'overline',
        background: 'pink'
      })

      // should not have border because disabled with if()
      expect(css).not.toHaveProperty('border')
    })
  })

  describe('get()', () => {
    it('should add existing CSS definition', () => {
      interface IButtonProps {
        type?: 'unset' | 'info' | 'success' | 'error'
        important?: boolean
      }

      const props: IButtonProps = {}

      const css = testBuildVariants(props)
        .variant('type', props.type || 'unset', {
          unset: {},

          info: {
            background: 'blue'
          },

          success: {
            background: 'green'
          },

          error: {
            background: 'red'
          }
        })
        .variant('important', props.important || false, {
          true: {
            textDecorationLine: 'underline'
          },

          false: {
            //
          }
        })
        .get('type', 'error')
        .end()

      expect(css).toEqual({
        background: 'red'
      })
    })
  })
})
