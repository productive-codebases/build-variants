import { deepMerge } from '../helpers/deepMerge'

describe('deepMerge', () => {
  it('should deeply merge nested objects', () => {
    const merged = deepMerge(
      {
        button: {
          color: 'red',
          border: '1px solid black'
        }
      },
      {
        button: {
          background: 'silver'
        }
      }
    )

    expect(merged).toEqual({
      button: {
        color: 'red',
        border: '1px solid black',
        background: 'silver'
      }
    })
  })

  it('should concatenate arrays', () => {
    const merged = deepMerge(
      {
        animationNames: ['fade-in']
      },
      {
        animationNames: ['slide-up']
      }
    )

    expect(merged).toEqual({
      animationNames: ['fade-in', 'slide-up']
    })
  })

  it('should preserve the left value when the right value is undefined', () => {
    const merged = deepMerge(
      {
        color: 'red',
        button: {
          border: '1px solid black'
        }
      },
      {
        color: undefined,
        button: {
          border: undefined,
          background: 'silver'
        }
      }
    )

    expect(merged).toEqual({
      color: 'red',
      button: {
        border: '1px solid black',
        background: 'silver'
      }
    })
  })

  it('should prepend a single left value when the right value is an array', () => {
    const merged = deepMerge(
      {
        animationNames: 'fade-in'
      },
      {
        animationNames: ['slide-up', 'scale-in']
      }
    )

    expect(merged).toEqual({
      animationNames: ['fade-in', 'slide-up', 'scale-in']
    })
  })
})
