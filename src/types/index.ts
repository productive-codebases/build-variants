export type VariantsDefinitions<TCSSObject extends object> = Map<
  string,
  TCSSObject
>

export type AllVariantsDefinitions<
  TProps extends object,
  TCSSObject extends object
> = Map<keyof TProps, VariantsDefinitions<TCSSObject>>

export interface IBuildVariantsBuilderOptions<
  TProps extends object,
  TCSSObject extends object
> {
  variantsDefinitions?: AllVariantsDefinitions<TProps, TCSSObject>
  apply?: boolean
  debug?: boolean
}
