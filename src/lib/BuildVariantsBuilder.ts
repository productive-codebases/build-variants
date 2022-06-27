import { deepMerge } from '../helpers/deepMerge'
import { AllVariantsDefinitions, IBuildVariantsBuilderOptions } from './type'

const logger = console

export default class BuildVariantsBuilder<
  TProps extends object,
  TCSSObject extends object
> {
  private _allVariantsDefinitions: AllVariantsDefinitions<TProps, TCSSObject> =
    new Map()

  private _cssParts: Set<TCSSObject> = new Set()

  constructor(
    private _props: TProps,
    private _options: IBuildVariantsBuilderOptions<TProps, TCSSObject> = {}
  ) {
    // when defined, use it to push variants in the same map, so that .get() could
    // get variants even if scoped by if(false).
    if (this._options.variantsDefinitions) {
      this._allVariantsDefinitions = this._options.variantsDefinitions
    }
  }

  /**
   * Define some CSS.
   */
  css(css: TCSSObject): this {
    if (this._options.apply === false) {
      return this
    }

    return this._addCssPart(css)
  }

  /**
   * Define CSS for a variant.
   */
  variant<TVariant extends string | boolean>(
    propName: keyof TProps,
    variant: TVariant,
    styles: TVariant extends string
      ? Record<TVariant, TCSSObject>
      : Record<'true' | 'false', TCSSObject>
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, styles)

    return this._addCssPart(
      (styles as Record<string, TCSSObject>)[String(variant)]
    )
  }

  /**
   * Define CSS for a list of variants.
   */
  variants<TVariant extends string>(
    propName: keyof TProps,
    variants: TVariant[],
    styles: Record<TVariant, TCSSObject>
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, styles)

    variants.forEach(variant => {
      this._addCssPart(styles[variant])
    })

    return this
  }

  /**
   * Define CSS for a variant with the help of a local BuildVariantsBuilder instance
   * to be able to compose with existing variants.
   */
  compoundVariant<TVariant extends string | boolean>(
    propName: keyof TProps,
    variant: TVariant,
    styles: TVariant extends string
      ? Record<
          TVariant,
          (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject
        >
      : Record<
          'true' | 'false',
          (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject
        >
  ): this {
    if (this._options.apply === false) {
      return this
    }

    const composedStyles = Object.entries(styles).reduce(
      (acc, [variant_, fn]) => {
        const css = fn(
          new BuildVariantsBuilder<TProps, TCSSObject>(this._props, {
            apply: true,
            variantsDefinitions: this._allVariantsDefinitions
          })
        )

        return {
          ...acc,
          [variant_]: css
        }
      },
      {} as Record<string, TCSSObject>
    )

    this._saveVariantsDefinition(propName, composedStyles)

    return this._addCssPart(composedStyles[String(variant)])
  }

  /**
   * Define compounds CSS for a list of variants.
   */
  compoundVariants<TVariant extends string>(
    propName: keyof TProps,
    variants: TVariant[],
    styles: TVariant extends string
      ? Record<
          TVariant,
          (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject
        >
      : Record<
          'true' | 'false',
          (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject
        >
  ): this {
    if (this._options.apply === false) {
      return this
    }

    variants.forEach(variant => {
      this.compoundVariant(propName, variant, styles)
    })

    return this
  }

  /**
   * Create a local BuildVariantsBuilder instance to add CSS according a predicate.
   */
  if(
    apply: boolean | (() => boolean),
    fn: (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject
  ): this {
    const applyValue = typeof apply === 'function' ? apply() : apply

    const builder = new BuildVariantsBuilder(this._props, {
      // pass variants definition to inject variant in the same map
      variantsDefinitions: this._allVariantsDefinitions,
      apply: applyValue
    })

    return this._addCssPart(fn(builder))
  }

  /**
   * Retrieve and save the CSS of an existing variant.
   */
  get<TPropName extends keyof TProps>(
    propName: TPropName,
    variant: TProps[TPropName]
  ): this {
    const variantDefinition = this._allVariantsDefinitions.get(propName)

    if (!variantDefinition) {
      return this
    }

    const cssPart = variantDefinition.get(String(variant))

    if (cssPart) {
      this._addCssPart(cssPart)
    }

    return this
  }

  /**
   * Deeply merge all CSS parts.
   */
  end(): TCSSObject {
    return Array.from(this._cssParts.values()).reduce((acc, cssPart) => {
      return deepMerge(acc, cssPart)
    }, {} as TCSSObject)
  }

  /**
   * Print privates for debugging.
   */
  debug(): this {
    logger.debug('Props:', this._props)
    logger.debug('Variants:', this._allVariantsDefinitions)
    logger.debug('CSS:', this._cssParts)

    return this
  }

  /**
   * Private
   */

  /**
   * Save variants definition.
   */
  private _saveVariantsDefinition<TVariant extends string>(
    propName: keyof TProps,
    styles: Record<TVariant, TCSSObject>
  ) {
    const variantsMap =
      this._allVariantsDefinitions.get(propName) ||
      new Map<string, TCSSObject>()

    Object.entries(styles).forEach(([variant, css]) => {
      variantsMap.set(variant, css as TCSSObject)
    })

    this._allVariantsDefinitions.set(propName, variantsMap)
  }

  /**
   * Add CSS part.
   */
  private _addCssPart(css: TCSSObject | undefined): this {
    if (!css) {
      return this
    }

    this._cssParts.add(css)

    return this
  }
}
