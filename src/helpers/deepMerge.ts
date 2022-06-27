import mergeWith from 'lodash.mergewith'

/**
 * Deep merge of T object.
 * Arrays will be concatened too and object will be deep merged.
 */
export function deepMerge<T1, T2>(obj1: T1, obj2: T2): T1 & T2 {
  const res = mergeWith(obj1, obj2, (v1, v2) => {
    if (Array.isArray(v1) && v2 !== undefined) {
      return v1.concat(v2)
    }

    if (Array.isArray(v2) && v1 !== undefined) {
      return [v1].concat(v2)
    }

    return undefined
  })

  return res
}
