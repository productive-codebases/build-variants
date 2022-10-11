import { deepMerge } from '../helpers/deepMerge'
import { logger } from '../helpers/logger'
import {
  IBuildVariantsMergerCssParts,
  IBuildVariantsMergerCssPartsOptions
} from '../types'
import { ObjectNonNullable } from '../types/helpers'

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
   * Deeply merge all CSS parts, optionally ordered by cssPart weight.
   */
  private _merge(): TCSSObject {
    const cssParts = Array.from(this._cssParts.values()).sort((a, b) => {
      // keep existing order if same weight
      if (a.options.weight === b.options.weight) {
        return 0
      }
      return a.options.weight > b.options.weight ? 1 : -1
    })

    // deep merge all parts
    return cssParts.reduce((acc, cssPart) => {
      return deepMerge(acc, cssPart.cssObject)
    }, {} as TCSSObject)
  }
}
