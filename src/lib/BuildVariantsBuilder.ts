import { ensureArray } from '../helpers/ensureArray'
import { isDefined } from '../helpers/isDefined'
import { logger } from '../helpers/logger'
import {
  BuildVariantsMergerCssPartsOptionsPublic,
  IBuildVariantsBuilderOptions,
  IBuildVariantsMergerCssPartsOptions,
  LitteralObject,
  PropsVariantsDefinitions
} from '../types'
import { Maybe, MaybeUndef, Perhaps } from '../types/helpers'
import BuildVariantsCSSMerger from './BuildVariantsCSSMerger'

type BuildVariantsBuilderFn<
  TProps extends LitteralObject,
  TCSSObject extends LitteralObject
> = (builder: BuildVariantsBuilder<TProps, TCSSObject>) => TCSSObject

export default class BuildVariantsBuilder<
  TProps extends LitteralObject,
  TCSSObject extends LitteralObject
> {
  private _allVariantsDefinitions: PropsVariantsDefinitions<
    TProps,
    TCSSObject
  > = new Map()

  private _cssMerger = new BuildVariantsCSSMerger<TCSSObject>()

  private _replacements: Map<string, (value: any) => TCSSObject> = new Map()

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

  css(
    cssOrFn: TCSSObject | BuildVariantsBuilderFn<TProps, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    if (this._options.apply === false) {
      return this
    }

    if (typeof cssOrFn === 'function') {
      // create an isolate builder instance to be able to compose with base variants
      // locally to the `css` block
      const cssObject = cssOrFn(
        new BuildVariantsBuilder<TProps, TCSSObject>(this._props, {
          apply: true,
          variantsDefinitions: this._allVariantsDefinitions
        })
      )

      return this._addCssPart(null, cssObject, options)
    }

    return this._addCssPart(null, cssOrFn, options)
  }

  // alias of css (useful when using buildVariants in a different context than CSS)
  values(
    cssOrFn: TCSSObject | BuildVariantsBuilderFn<TProps, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    return this.css(cssOrFn, options)
  }

  /**
   * Define CSS for a variant.
   */
  variant<TVariant extends string>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<TVariant, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this

  variant<TVariant extends boolean>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<
      // variant for boolean values
      'true' | 'false',
      TCSSObject
    >,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this

  variant<TVariant extends string>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<TVariant, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, cssDefinitions)

    if (!isDefined(variant)) {
      return this
    }

    return this._addCssPart(
      propName,
      (cssDefinitions as Record<string, TCSSObject>)[String(variant)],
      options
    )
  }

  /**
   * Define CSS for a list of variants.
   */
  variants<TVariant extends string>(
    propName: keyof TProps,
    variants: Perhaps<TVariant[]>,
    cssDefinitions: Record<TVariant, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    if (this._options.apply === false) {
      return this
    }

    this._saveVariantsDefinition(propName, cssDefinitions)

    if (!isDefined(variants)) {
      return this
    }

    variants.forEach(variant => {
      this._addCssPart(propName, cssDefinitions[variant], options)
    })

    return this
  }

  /**
   * Define CSS for a variant with the help of a local BuildVariantsBuilder instance
   * to be able to compose with existing variants.
   */
  compoundVariant<TVariant extends string>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>
  ): this

  compoundVariant<TVariant extends boolean>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<
      // compoundVariant for boolean values
      'true' | 'false',
      BuildVariantsBuilderFn<TProps, TCSSObject>
    >
  ): this

  compoundVariant<TVariant extends string>(
    propName: keyof TProps,
    variant: Perhaps<TVariant>,
    cssDefinitions: Record<
      TVariant,
      BuildVariantsBuilderFn<TProps, TCSSObject>
    >,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    if (this._options.apply === false) {
      return this
    }

    const composedCss = Object.entries(cssDefinitions).reduce(
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

    this._saveVariantsDefinition(propName, composedCss)

    if (!isDefined(variant)) {
      return this
    }

    return this._addCssPart(propName, composedCss[String(variant)], options)
  }

  /**
   * Define compounds CSS for a list of variants.
   */
  compoundVariants<TVariant extends string>(
    propName: keyof TProps,
    variants: Perhaps<TVariant[]>,
    cssDefinitions: Record<TVariant, BuildVariantsBuilderFn<TProps, TCSSObject>>
  ): this {
    if (this._options.apply === false) {
      return this
    }

    if (!isDefined(variants)) {
      return this
    }

    variants.forEach(variant => {
      this.compoundVariant(propName, variant, cssDefinitions)
    })

    return this
  }

  /**
   * Create a local BuildVariantsBuilder instance to add CSS according to a predicate.
   */
  if(
    apply: boolean | (() => boolean),
    fn: BuildVariantsBuilderFn<TProps, TCSSObject>,
    options?: BuildVariantsMergerCssPartsOptionsPublic
  ): this {
    const applyValue = typeof apply === 'function' ? apply() : apply

    const builder = new BuildVariantsBuilder(this._props, {
      apply: applyValue,
      variantsDefinitions: this._allVariantsDefinitions
    })

    return this._addCssPart(null, fn(builder), options)
  }

  /**
   * Retrieve and save the CSS of an existing variant.
   */
  get<TPropName extends keyof TProps>(
    propName: TPropName,
    variants: TProps[TPropName],
    options?: BuildVariantsMergerCssPartsOptionsPublic
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
        this._addCssPart(null, cssPart, options)
      }
    })

    return this
  }

  /**
   * Save replacements of some CSS definitions.
   */
  replace<TCSSPropName extends keyof TCSSObject>(
    cssPropName: TCSSPropName,
    fn: (value: TCSSObject[TCSSPropName]) => TCSSObject
  ): this {
    this._replacements.set(String(cssPropName), fn)
    return this
  }

  /**
   * Deeply merge all CSS parts.
   */
  end(): TCSSObject {
    const css = this._cssMerger.end()

    if (!this._replacements.size) {
      return css
    }

    return this._applyCSSReplacements(css)
  }

  /**
   * Print privates for debugging.
   */
  debug(apply?: boolean | (() => boolean)): this {
    const displayDebug = isDefined(apply)
      ? typeof apply === 'function'
        ? apply()
        : apply
      : true

    if (!displayDebug) {
      return this
    }

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
    cssDefinitions: Record<TVariant, TCSSObject>
  ) {
    const variantsMap =
      this._allVariantsDefinitions.get(propName) ||
      new Map<string, TCSSObject>()

    Object.entries(cssDefinitions).forEach(([variant, css]) => {
      variantsMap.set(variant, css as TCSSObject)
    })

    this._allVariantsDefinitions.set(propName, variantsMap)
  }

  /**
   * Add CSS part.
   */
  private _addCssPart(
    propName: Maybe<keyof TProps>,
    css: MaybeUndef<TCSSObject>,
    options?: IBuildVariantsMergerCssPartsOptions
  ): this {
    if (!css) {
      return this
    }

    if (!Object.keys(css).length) {
      return this
    }

    const isPrivate = propName?.toString().startsWith('_') === true

    this._cssMerger.add(css, {
      ...options,
      _privateProp: isPrivate
    })

    return this
  }

  /**
   * Apply CSS replacements.
   * For each replacement found, delete the existing CSS definitions and merge the
   * new ones from the defined function.
   */
  private _applyCSSReplacements(css: TCSSObject): TCSSObject {
    const merger = new BuildVariantsCSSMerger<TCSSObject>().add(css)

    Array.from(this._replacements.entries()).forEach(([cssPropName, fn]) => {
      if (cssPropName in css) {
        const value = (css as any)[cssPropName]
        const cssReplacement = fn(value)
        delete (css as any)[cssPropName]

        merger.add(cssReplacement)
      }
    })

    return merger.end()
  }
}
