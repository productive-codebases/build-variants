import { CSSObject } from 'styled-components'
import BuildVariantsCSSMerger from '../lib/BuildVariantsCSSMerger'
import { IBuildVariantsMergerCssParts } from '../types'

describe('BuildVariantsCSSMerger', () => {
  it('should merge CSS', () => {
    const cssParts: Array<IBuildVariantsMergerCssParts<CSSObject>> = [
      {
        cssObject: {
          color: 'red'
        },
        options: {
          weight: 0
        }
      },
      {
        cssObject: {
          color: 'lime',
          background: 'silver'
        },
        options: {
          weight: 0
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.merge()).toEqual({
      color: 'lime',
      background: 'silver'
    })
  })

  it('should merge CSS according to the weight', () => {
    const cssParts: Array<IBuildVariantsMergerCssParts<CSSObject>> = [
      {
        cssObject: {
          color: 'red'
        },
        options: {
          weight: 10
        }
      },
      {
        cssObject: {
          color: 'lime',
          background: 'silver'
        },
        options: {
          weight: 0
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.merge()).toEqual({
      color: 'red',
      background: 'silver'
    })
  })

  it('should deeply merge CSS', () => {
    const cssParts: Array<IBuildVariantsMergerCssParts<CSSObject>> = [
      {
        cssObject: {
          '> button': {
            color: 'red'
          },

          border: '1px solid black'
        },
        options: {
          weight: 0
        }
      },
      {
        cssObject: {
          '> button': {
            background: 'silver'
          }
        },
        options: {
          weight: 0
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.merge()).toEqual({
      border: '1px solid black',

      '> button': {
        color: 'red',
        background: 'silver'
      }
    })
  })
})
