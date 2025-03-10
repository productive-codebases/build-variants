import { deepMerge } from '../helpers/deepMerge'
import { logger } from '../helpers/logger'
import type {
  IBuildVariantsMergerCssParts,
  IBuildVariantsMergerCssPartsOptions
} from '../types'
import type { ObjectNonNullable } from '../types/helpers'

export default class BuildVariantsCSSMerger<TCSSObject extends object> {
  private _cssParts: Set<IBuildVariantsMergerCssParts<TCSSObject>> = new Set()

  /**
   * Add a CSS part.
   */
  add(
    cssObject: TCSSObject,
    options_?: IBuildVariantsMergerCssPartsOptions
  ): this {
    const options: ObjectNonNullable<IBuildVariantsMergerCssPartsOptions> = {
      weight: 0,
      _privateProp: false,
      ...options_
    }

    this._cssParts.add({
      cssObject,
      options
    })

    return this
  }

  /**
   * Merge and transform CSS parts.
   */
  end(): TCSSObject {
    return this._merge()
  }

  /**
   * Print privates for debugging.
   */
  debug(): this {
    logger.debug('CSS parts:', this._cssParts)
    logger.debug('CSS:', this._merge())

    return this
  }

  /**
   * Private
   */

  /**
   * Deeply merge all CSS parts, optionally ordered by weight or _privateProp.
   */
  private _merge(): TCSSObject {
    function sortByWeight(
      a: IBuildVariantsMergerCssParts<TCSSObject>,
      b: IBuildVariantsMergerCssParts<TCSSObject>
    ) {
      // keep existing order if same weight
      if (a.options.weight === b.options.weight) {
        return 0
      }

      return a.options.weight > b.options.weight ? 1 : -1
    }

    function sortByPrivateProp(
      a: IBuildVariantsMergerCssParts<TCSSObject>,
      b: IBuildVariantsMergerCssParts<TCSSObject>
    ) {
      // keep existing order if same _privateProp
      if (a.options._privateProp === b.options._privateProp) {
        return 0
      }

      return a.options._privateProp > b.options._privateProp ? 1 : -1
    }

    const cssParts = Array.from(this._cssParts.values()).sort((a, b) => {
      return sortByWeight(a, b) | sortByPrivateProp(a, b)
    })

    // deep merge all parts
    return cssParts.reduce((acc, cssPart) => {
      return deepMerge(acc, cssPart.cssObject)
    }, {} as TCSSObject)
  }
}
