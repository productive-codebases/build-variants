import { ensureArray } from '../helpers/ensureArray'
import { logger } from '../helpers/logger'
import {
  IBuildVariantsBuilderOptions,
  IBuildVariantsMergerCssPartsOptions,
  PropsVariantsDefinitions
} from '../types'
import { MaybeUndef } from '../types/helpers'
import BuildVariantsCSSMerger from './BuildVariantsCSSMerger'

type BuildVariantsBuilderFn<
  TProps extends object,
  TCSSObject extends object
> = (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject

export default class BuildVariantsBuilder<
  TProps extends object,
  TCSSObject extends object
> {
  private _allVariantsDefinitions: PropsVariantsDefinitions<
    TProps,
    TCSSObject
  > = new Map()

  private _cssMerger = new BuildVariantsCSSMerger<TCSSObject>()

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
  css(css: TCSSObject, options?: IBuildVariantsMergerCssPartsOptions): this {
    if (this._options.apply === false) {
      return this
    }

    return this._addCssPart(css, options)
  }

  /**
   * Define CSS for a variant.
   */
  variant<TVariant extends string>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<TVariant, TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this

  variant<TVariant extends boolean>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<'true' | 'false', TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this

  variant<TVariant extends string>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<TVariant, TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, styles)

    return this._addCssPart(
      (styles as Record<string, TCSSObject>)[String(variant)],
      options
    )
  }

  /**
   * Define CSS for a list of variants.
   */
  variants<TVariant extends string>(
    propName: keyof TProps,
    variants: TVariant[],
    styles: Record<TVariant, TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, styles)

    variants.forEach(variant => {
      this._addCssPart(styles[variant], options)
    })

    return this
  }

  /**
   * Define CSS for a variant with the help of a local BuildVariantsBuilder instance
   * to be able to compose with existing variants.
   */
  compoundVariant<TVariant extends string>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>
  ): this

  compoundVariant<TVariant extends boolean>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<'true' | 'false', BuildVariantsBuilderFn<TProps, TCSSObject>>
  ): this

  compoundVariant<TVariant extends string>(
    propName: keyof TProps,
    variant: TVariant,
    styles: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (this._options.apply === false) {
      return this
    }

    const composedStyles = Object.entries(styles).reduce(
      (acc, [variant_, fn]) => {
        const fn_ = fn as BuildVariantsBuilderFn<TProps, TCSSObject>

        const css = fn_(
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

    return this._addCssPart(composedStyles[String(variant)], options)
  }

  /**
   * Define compounds CSS for a list of variants.
   */
  compoundVariants<TVariant extends string>(
    propName: keyof TProps,
    variants: TVariant[],
    styles: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>
  ): this

  compoundVariants<TVariant extends string>(
    propName: keyof TProps,
    variants: TVariant[],
    styles: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>
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
   * Create a local BuildVariantsBuilder instance to add CSS according to a predicate.
   */
  if(
    apply: boolean | (() => boolean),
    fn: BuildVariantsBuilderFn<TProps, TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    const applyValue = typeof apply === 'function' ? apply() : apply

    const builder = new BuildVariantsBuilder(this._props, {
      apply: applyValue,
      variantsDefinitions: this._allVariantsDefinitions
    })

    return this._addCssPart(fn(builder), options)
  }

  /**
   * Retrieve and save the CSS of an existing variant.
   */
  get<TPropName extends keyof TProps>(
    propName: TPropName,
    variants: TProps[TPropName],
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (this._options.apply === false) {
      return this
    }

    const variantDefinition = this._allVariantsDefinitions.get(propName)

    if (!variantDefinition) {
      return this
    }

    ensureArray(variants).forEach(variant => {
      const cssPart = variantDefinition.get(String(variant))

      if (cssPart) {
        this._addCssPart(cssPart, options)
      }
    })

    return this
  }

  /**
   * Deeply merge all CSS parts.
   */
  end(): TCSSObject {
    return this._cssMerger.merge()
  }

  /**
   * Print privates for debugging.
   */
  debug(): this {
    logger.debug('Props:', this._props)
    logger.debug('Variants:', this._allVariantsDefinitions)
    this._cssMerger.debug()

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
  private _addCssPart(
    css: MaybeUndef<TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (!css) {
      return this
    }

    if (!Object.keys(css).length) {
      return this
    }

    this._cssMerger.add(css, options)

    return this
  }
}
