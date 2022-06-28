import { deepMerge } from '../helpers/deepMerge'
import { logger } from '../helpers/logger'

export default class BuildVariantsCSSMerger<TCSSObject extends object> {
  private _cssParts: Set<TCSSObject> = new Set()

  /**
   * Add a CSS part.
   */
  add(cssPart: TCSSObject): this {
    this._cssParts.add(cssPart)
    return this
  }

  /**
   * Deeply merge all CSS parts.
   */
  merge(): TCSSObject {
    return Array.from(this._cssParts.values()).reduce((acc, cssPart) => {
      return deepMerge(acc, cssPart)
    }, {} as TCSSObject)
  }

  /**
   * Print privates for debugging.
   */
  debug(): this {
    logger.debug('CSS:', this._cssParts)

    return this
  }
}
