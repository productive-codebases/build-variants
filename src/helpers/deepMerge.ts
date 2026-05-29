/**
 * Deep merge of T object.
 * Arrays will be concatened too and object will be deep merged.
 */
export function deepMerge<T1, T2>(obj1: T1, obj2: T2): T1 & T2 {
  return mergeValues(obj1, obj2) as T1 & T2
}

/**
 * Merge two values recursively.
 */
function mergeValues<TLeft, TRight>(
  left: TLeft,
  right: TRight
): TLeft | TRight {
  if (Array.isArray(left) && right !== undefined) {
    return left.concat(right) as TLeft | TRight
  }

  if (Array.isArray(right) && left !== undefined) {
    return [left].concat(right) as TLeft | TRight
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    return mergeObjects(left, right) as TLeft | TRight
  }

  return right === undefined ? left : right
}

/**
 * Merge two plain objects recursively.
 */
function mergeObjects(
  left: Record<string, unknown>,
  right: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...left }

  Object.entries(right).forEach(([key, rightValue]) => {
    const leftValue = merged[key]

    merged[key] = mergeValues(leftValue, rightValue)
  })

  return merged
}

/**
 * Narrow a value to a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
