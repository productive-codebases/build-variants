import { ObjectNonNullable } from './helpers'

export type LitteralObject = object

export type VariantDefinitions<TCSSObject extends object> = Map<
  string,
  TCSSObject
>

export type PropsVariantsDefinitions<
  TProps extends object,
  TCSSObject extends object
> = Map<keyof TProps, VariantDefinitions<TCSSObject>>

export interface IBuildVariantsBuilderOptions<
  TProps extends object,
  TCSSObject extends object
> {
  // pass variants definition to inject variant in the same map
  variantsDefinitions?: PropsVariantsDefinitions<TProps, TCSSObject>

  // apply or not CSS parts
  apply?: boolean
}

export interface IBuildVariantsMergerCssPartsOptions {
  weight?: number
}

export interface IBuildVariantsMergerCssParts<TCSSObject extends object> {
  cssObject: TCSSObject
  options: ObjectNonNullable<IBuildVariantsMergerCssPartsOptions>
}
