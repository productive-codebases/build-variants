import { CSSObject } from 'styled-components'
import { newBuildVariants } from '../lib/newBuildVariants'
import { LitteralObject } from '../types'

describe('BuildVariantsBuilder', () => {
  function testBuildVariants<
    TProps extends LitteralObject,
    TCSSObject extends LitteralObject = CSSObject
  >(props: TProps) {
    return newBuildVariants<TProps, TCSSObject>(props)
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

    describe('with builder', () => {
      it('should create an isolated builder instance', () => {
        interface ISvgProps {
          _variants?: Array<'default' | 'active'>
          variant?: 'default' | 'active'
        }

        const props: ISvgProps = {}

        const css = testBuildVariants(props)
          .variants('_variants', props._variants || ['default'], {
            default: {
              '> path': {
                stroke: 'black'
              }
            },

            active: {
              '> path': {
                stroke: 'red'
              }
            }
          })
          .compoundVariant('variant', props.variant || 'default', {
            default: builder =>
              builder
                .get('_variants', ['default'])
                // Get an isolated builder_ instance to be able to compose with base
                // variants only locally for the :hover directive
                .css(builder_ => ({
                  ':hover': builder_.get('_variants', ['active']).end()
                }))
                .end(),

            active: builder => builder.get('_variants', ['active']).end()
          })
          .end()

        expect(css).toEqual({
          '> path': {
            stroke: 'black'
          },

          ':hover': {
            '> path': {
              stroke: 'red'
            }
          }
        })
      })
    })
  })

  describe('variant()', () => {
    it('should not apply variant if the props value is undefined', () => {
      interface IButtonProps {
        type?: 'success' | 'error'
      }

      const props: IButtonProps = {}

      const css = testBuildVariants(props)
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

      expect(css).toHaveProperty('color', 'white')
      expect(css).not.toHaveProperty('background')
    })

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
    it('should not apply variants if the props value is undefined', () => {
      interface IButtonProps {
        font?: Array<'strong' | 'underline' | 'italic'>
      }

      const props: IButtonProps = {}

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

      expect(css).not.toHaveProperty('fontWeight')
      expect(css).not.toHaveProperty('textDecorationLine')
      expect(css).not.toHaveProperty('textDecoration')
    })

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
    it('should not apply if the props value is undefined', () => {
      interface IButtonProps {
        type?: 'success' | 'error'
      }

      const props: IButtonProps = {}

      const css = testBuildVariants(props)
        .compoundVariant('type', props.type, {
          success: builder => builder.css({ color: 'green' }).end(),
          error: builder => builder.css({ color: 'red' }).end()
        })
        .end()

      expect(css).not.toHaveProperty('color')
    })

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
    it('should not apply if the props value is undefined', () => {
      interface IButtonProps {
        variants?: Array<'variant1' | 'variant2'>
      }

      const props: IButtonProps = {}

      const css = testBuildVariants(props)
        .compoundVariants('variants', props.variants, {
          variant1: builder => builder.css({ color: 'blue' }).end(),
          variant2: builder => builder.css({ color: 'red' }).end()
        })
        .end()

      expect(css).not.toHaveProperty('color')
    })

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

  describe('replace()', () => {
    it('should replace some CSS definitions', () => {
      type CustomCSSObject = CSSObject & {
        $debug?: 'true' | 'false'
      }

      const css = testBuildVariants<{}, CustomCSSObject>({})
        .css({
          $debug: 'true',
          opacity: 0.5
        })

        .replace('opacity', value => {
          return {
            opacity: value,
            MozOpacity: value
          }
        })

        .replace('$debug', value => {
          switch (value) {
            case 'true': {
              return {
                outline: '1px solid red'
              }
            }

            case 'false': {
              return {}
            }

            default:
              return {}
          }
        })

        .end()

      expect(css).not.toHaveProperty('$debug')
      expect(css).toHaveProperty('outline', '1px solid red')

      expect(css).toHaveProperty('opacity', 0.5)
      expect(css).toHaveProperty('MozOpacity', 0.5)
    })
  })

  describe('get()', () => {
    it('should add existing CSS definition', () => {
      interface IButtonProps {
        type?: 'unset' | 'info' | 'success' | 'error'
        font?: Array<'strong' | 'italic'>
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
        .variants('font', props.font || [], {
          strong: {
            fontWeight: 'bold'
          },

          italic: {
            textDecoration: 'italic'
          }
        })
        .get('type', 'error')
        .get('font', ['strong', 'italic'])
        .end()

      expect(css).toEqual({
        background: 'red',
        fontWeight: 'bold',
        textDecoration: 'italic'
      })
    })
  })

  describe('with weight', () => {
    describe('css()', () => {
      it('should apply css according weight', () => {
        const css = testBuildVariants({})
          // should be applyied because using a weight
          .css(
            {
              color: 'red',
              border: '1px solid black'
            },
            { weight: 10 }
          )
          .css({
            color: 'lime'
          })
          .end()

        expect(css).toEqual({
          color: 'red',
          border: '1px solid black'
        })
      })
    })

    describe('variant()', () => {
      it('should apply css according weight', () => {
        interface IProps {
          color: 'primary' | 'secondary'
        }

        const props: IProps = {
          color: 'primary'
        }

        const css = testBuildVariants(props)
          .variant(
            'color',
            props.color,
            {
              primary: {
                color: 'black',
                background: 'blue'
              },

              secondary: {
                color: 'silver',
                background: 'white'
              }
            },
            { weight: 10 }
          )

          // should not override the variant because the variant is weighted
          .css({
            color: 'red'
          })

          .end()

        expect(css).toEqual({
          color: 'black',
          background: 'blue'
        })
      })
    })

    describe('if()', () => {
      it('should apply css according weight', () => {
        const css = testBuildVariants({})
          .if(
            true,
            builder => {
              return builder
                .css({
                  color: 'red'
                })
                .end()
            },
            { weight: 20 }
          )

          .if(
            true,
            builder => {
              return builder
                .css({
                  color: 'blue'
                })
                .end()
            },
            { weight: 10 }
          )

          .css({
            color: 'lime'
          })

          .end()

        expect(css).toEqual({
          color: 'red'
        })
      })
    })
  })

  describe('With custom object shape', () => {
    interface IAnimateObject {
      rotate?: number
      scale?: number
      x?: number
      y?: number
    }

    function testBuildVariantsForCustomShapes<
      TProps extends LitteralObject,
      TAnimateObject extends LitteralObject = IAnimateObject
    >(props: TProps) {
      return newBuildVariants<TProps, TAnimateObject>(props)
    }

    it('should apply values', () => {
      interface IButtonAnimateProps {
        _rotate?: 'left' | 'right'
        _scale?: 'small' | 'big'
        variant?: 'alert' | 'modal'
      }

      const props: IButtonAnimateProps = {
        variant: 'alert'
      }

      const css = testBuildVariantsForCustomShapes(props)
        .values({
          rotate: 0,
          scale: 0,
          x: 0,
          y: 0
        })
        .variant('_rotate', props._rotate, {
          left: {
            rotate: -90
          },

          right: {
            rotate: 90
          }
        })
        .variant('_scale', props._scale, {
          small: {
            scale: 25
          },

          big: {
            scale: 50
          }
        })
        .compoundVariant('variant', props.variant, {
          alert: builder =>
            builder.get('_rotate', 'left').get('_scale', 'big').end(),
          modal: builder =>
            builder.get('_rotate', 'right').get('_scale', 'small').end()
        })
        .end()

      expect(css).toEqual({
        rotate: -90,
        scale: 50,
        x: 0,
        y: 0
      })
    })
  })
})
