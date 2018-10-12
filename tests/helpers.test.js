import tuxi from '../lib'
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

describe('helpers.processTaskConfig', () => {
  test('Allows changing default spinnerDelay', () => {
    tuxi.config.defaults.spinnerDelay = 1000
    const { spinnerDelay } = helpers.processTaskConfig(() => null)
    expect(spinnerDelay).toBe(1000)
  })

  test('Throws error with incorrect delay type', () => {
    tuxi.config.defaults.spinnerDelay = 'abc'
    expect(() => helpers.processTaskConfig(() => null)).toThrow()
  })
})
