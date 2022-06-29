// return T | null
export type Maybe<T> = T | null

// return T | undefined
export type MaybeUndef<T> = T | undefined

// return T | null | undefined
export type Perhaps<T> = T | null | undefined

// remove nullable from an object
export type ObjectNonNullable<O> = {
  [Key in keyof O]-?: NonNullable<O[Key]>
}
