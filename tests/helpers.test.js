import helpers from '../lib/helpers'

describe('helpers.validate', () => {
  test('single type: success', () => {
    expect(() => helpers.validate(1, 'number', 'num')).not.toThrow()
  })

  test('single type: failure', () => {
    expect(() => helpers.validate('1', 'number', 'num')).toThrow()
  })

  test('multiple types: success', () => {
    expect(() =>
      helpers.validate('1', ['number', 'string'], 'num')
    ).not.toThrow()
  })

  test('multiple types: failure', () => {
    expect(() =>
      helpers.validate(() => '1', ['number', 'string'], 'num')
    ).toThrow()
  })
})
