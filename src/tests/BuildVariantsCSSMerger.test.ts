import BuildVariantsCSSMerger from '../lib/BuildVariantsCSSMerger'
import type { IBuildVariantsMergerCssParts } from '../types'
import type { CSSObject } from '../types/cssObject'

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

  it('should concatenate arrays when deeply merging CSS', () => {
    interface IArrayObject {
      animationNames?: string[]
    }

    const cssParts: Array<IBuildVariantsMergerCssParts<IArrayObject>> = [
      {
        cssObject: {
          animationNames: ['fade-in']
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      },
      {
        cssObject: {
          animationNames: ['slide-up']
        },
        options: {
          weight: 0,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger<IArrayObject>()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
      animationNames: ['fade-in', 'slide-up']
    })
  })

  it('should prioritize weight before private prop ordering', () => {
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
          color: 'lime'
        },
        options: {
          weight: 10,
          _privateProp: false
        }
      }
    ]

    const cssMerger = new BuildVariantsCSSMerger()

    cssParts.forEach(cssPart => {
      cssMerger.add(cssPart.cssObject, cssPart.options)
    })

    expect(cssMerger.end()).toEqual({
      color: 'lime'
    })
  })
})
