import BuildVariantsCSSMerger from '../lib/BuildVariantsCSSMerger'
import { IBuildVariantsMergerCssParts } from '../types'
import { CSSObject } from '../types/cssObject'

describe('BuildVariantsCSSMerger', () => {
  it('should merge CSS', () => {
    const cssParts: Array<IBuildVariantsMergerCssParts<CSSObject>> = [
      {
        cssObject: {
          color: 'red'
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      },
      {
        cssObject: {
          color: 'lime',
          background: 'silver'
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
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
          weight: 10,
          _privateProp: false
        }
      },
      {
        cssObject: {
          color: 'lime',
          background: 'silver'
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
      color: 'red',
      background: 'silver'
    })
  })

  it('should merge CSS of private props last', () => {
    const cssParts: Array<IBuildVariantsMergerCssParts<CSSObject>> = [
      {
        cssObject: {
          color: 'red'
        },
        options: {
          weight: 0,
          _privateProp: true
        }
      },
      {
        cssObject: {
          color: 'lime',
          background: 'silver'
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
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
          weight: 0,
          _privateProp: false
        }
      },
      {
        cssObject: {
          '> button': {
            background: 'silver'
          }
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
      border: '1px solid black',

      '> button': {
        color: 'red',
        background: 'silver'
      }
    })
  })
})
