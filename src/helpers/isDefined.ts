import { Perhaps } from '../types/helpers'

/**
 * Returns a type predicate to filter undefined values of an array.
 *
 * Usage:
 * arr.filter(isDefined)
 */
export function isDefined<T>(o: Perhaps<T>): o is T {
  return o !== undefined && o !== null
}
