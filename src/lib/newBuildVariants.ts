import type { LiteralObject } from '../types'
import BuildVariantsBuilder from './BuildVariantsBuilder'

/**
 * Shortcut to instantiate a new BuildVariantsBuilder instance, directly after the
 * styled declaration.
 *
 * Usage:
 *
 * const Div = styled.div<ITestProps>(props => {
 *   return buildVariants(props, builder => {
 *     return builder
 *       .css({
 *         color: 'red'
 *       })
 *       .end()
 *   })
 * })
 */
export function newBuildVariants<
  TProps extends LiteralObject,
  TCSSObject extends LiteralObject
>(props: TProps): BuildVariantsBuilder<TProps, TCSSObject> {
  return new BuildVariantsBuilder<TProps, TCSSObject>(props)
}
